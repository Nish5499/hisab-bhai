import React, { createContext, useContext, useEffect, useState } from 'react';
import { Group, Expense, Settlement, AppNotification, GroupBalances, SuggestedTransfer, SplitMethod, ExpenseCategory } from '../../types';
import { INITIAL_DEMO_GROUPS, INITIAL_DEMO_EXPENSES, INITIAL_DEMO_SETTLEMENTS, INITIAL_DEMO_NOTIFICATIONS, DEMO_USERS } from '../../lib/demo/demoData';
import { calculateGroupBalances, simplifyDebts } from '../../lib/money/calculations';
import { useAuth } from '../auth/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';

interface AddExpenseInput {
  groupId: string;
  title: string;
  description?: string;
  amountPaise: number;
  category: ExpenseCategory;
  expenseDate: string;
  splitType: SplitMethod;
  payers: { userId: string; amountPaidPaise: number }[];
  participants: { userId: string; shareAmountPaise: number; rawShareValue: number; isExcluded: boolean }[];
}

interface DataContextType {
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  notifications: AppNotification[];
  isLoading: boolean;
  createGroup: (name: string, description: string, emoji: string, category: string, memberIds: string[]) => Promise<Group>;
  addExpense: (input: AddExpenseInput) => Promise<Expense>;
  editExpense: (expenseId: string, input: AddExpenseInput) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  recordSettlement: (groupId: string, payerId: string, receiverId: string, amountPaise: number, notes?: string) => Promise<Settlement>;
  reverseSettlement: (settlementId: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  getGroupBalancesForGroup: (groupId: string) => GroupBalances[];
  getGroupTransfersForGroup: (groupId: string) => SuggestedTransfer[];
  getPersonalBalanceSummary: (userId: string) => { totalYouOwePaise: number; totalYouAreOwedPaise: number; netBalancePaise: number; unsettledCount: number };
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    if (isDemoMode) {
      const savedGroups = localStorage.getItem('hisabbhai_demo_groups');
      const savedExpenses = localStorage.getItem('hisabbhai_demo_expenses');
      const savedSettlements = localStorage.getItem('hisabbhai_demo_settlements');
      const savedNotifications = localStorage.getItem('hisabbhai_demo_notifications');

      setGroups(savedGroups ? JSON.parse(savedGroups) : INITIAL_DEMO_GROUPS);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : INITIAL_DEMO_EXPENSES);
      setSettlements(savedSettlements ? JSON.parse(savedSettlements) : INITIAL_DEMO_SETTLEMENTS);
      setNotifications(savedNotifications ? JSON.parse(savedNotifications) : INITIAL_DEMO_NOTIFICATIONS);
      setIsLoading(false);
    } else if (isSupabaseConfigured() && user) {
      loadSupabaseData();
    } else {
      setIsLoading(false);
    }
  }, [isDemoMode, user?.id]);

  // Save changes to localStorage in demo mode
  useEffect(() => {
    if (isDemoMode && !isLoading) {
      localStorage.setItem('hisabbhai_demo_groups', JSON.stringify(groups));
      localStorage.setItem('hisabbhai_demo_expenses', JSON.stringify(expenses));
      localStorage.setItem('hisabbhai_demo_settlements', JSON.stringify(settlements));
      localStorage.setItem('hisabbhai_demo_notifications', JSON.stringify(notifications));
    }
  }, [groups, expenses, settlements, notifications, isDemoMode, isLoading]);

  const loadSupabaseData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch user's groups
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id, role, groups (*)')
        .eq('user_id', user.id);

      if (memberRows) {
        const fetchedGroups: Group[] = [];
        for (const row of memberRows) {
          const grp = row.groups as unknown as Group;
          if (grp && !grp.is_deleted) {
            // Fetch all members for this group
            const { data: grpMembers } = await supabase
              .from('group_members')
              .select('id, group_id, user_id, role, joined_at, profiles (*)')
              .eq('group_id', grp.id);

            grp.members = (grpMembers || []).map((m: any) => ({
              id: m.id,
              group_id: m.group_id,
              user_id: m.user_id,
              role: m.role,
              joined_at: m.joined_at,
              profile: m.profiles,
            }));
            fetchedGroups.push(grp);
          }
        }
        setGroups(fetchedGroups);

        const groupIds = fetchedGroups.map(g => g.id);
        if (groupIds.length > 0) {
          // 2. Fetch expenses
          const { data: expRows } = await supabase
            .from('expenses')
            .select(`
              *,
              payers:expense_payers(*, profiles(*)),
              participants:expense_participants(*, profiles(*))
            `)
            .in('group_id', groupIds)
            .eq('is_deleted', false)
            .order('expense_date', { ascending: false });

          if (expRows) {
            setExpenses(expRows as unknown as Expense[]);
          }

          // 3. Fetch settlements
          const { data: stlRows } = await supabase
            .from('settlements')
            .select('*, payer:profiles!payer_id(*), receiver:profiles!receiver_id(*)')
            .in('group_id', groupIds)
            .order('settled_at', { ascending: false });

          if (stlRows) {
            setSettlements(stlRows as unknown as Settlement[]);
          }
        }
      }

      // 4. Fetch notifications
      const { data: notifRows } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notifRows) {
        setNotifications(notifRows as AppNotification[]);
      }
    } catch (err) {
      console.error('Failed to load Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (
    name: string,
    description: string,
    emoji: string,
    category: string,
    memberIds: string[]
  ): Promise<Group> => {
    const creatorId = user?.id || 'demo-user';
    const newGroupId = isDemoMode ? `group_${Date.now()}` : crypto.randomUUID();

    if (isDemoMode) {
      const allMembers = Array.from(new Set([creatorId, ...memberIds]));
      const groupMembers = allMembers.map(mId => {
        const foundUser = DEMO_USERS.find(u => u.id === mId) || {
          id: mId,
          full_name: 'Member',
          email: `${mId}@example.com`,
          preferred_currency: 'INR',
          created_at: '',
          updated_at: '',
        };
        return {
          id: `gm_${Date.now()}_${mId}`,
          group_id: newGroupId,
          user_id: mId,
          role: mId === creatorId ? ('owner' as const) : ('member' as const),
          joined_at: new Date().toISOString(),
          profile: foundUser,
        };
      });

      const newGroup: Group = {
        id: newGroupId,
        name,
        description,
        avatar_emoji: emoji || '🪙',
        category: category || 'Friends',
        simplify_debts: true,
        created_by: creatorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members: groupMembers,
      };

      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    }

    // Supabase creation
    const { data: grpData, error: grpErr } = await supabase
      .from('groups')
      .insert({
        id: newGroupId,
        name,
        description,
        avatar_emoji: emoji,
        category,
        simplify_debts: true,
        created_by: creatorId,
      })
      .select()
      .single();

    if (grpErr) throw grpErr;

    // Add creator and members
    const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const memberInserts = allMemberIds.map(mId => ({
      group_id: newGroupId,
      user_id: mId,
      role: mId === creatorId ? 'owner' : 'member',
    }));

    await supabase.from('group_members').insert(memberInserts);
    await loadSupabaseData();
    return grpData as Group;
  };

  const addExpense = async (input: AddExpenseInput): Promise<Expense> => {
    const creatorId = user?.id || 'demo-user';
    const newExpenseId = isDemoMode ? `exp_${Date.now()}` : crypto.randomUUID();

    if (isDemoMode) {
      const newExpense: Expense = {
        id: newExpenseId,
        group_id: input.groupId,
        title: input.title,
        description: input.description,
        amount_paise: input.amountPaise,
        category: input.category,
        expense_date: input.expenseDate,
        split_type: input.splitType,
        created_by: creatorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payers: input.payers.map(p => ({
          user_id: p.userId,
          amount_paid_paise: p.amountPaidPaise,
          profile: DEMO_USERS.find(u => u.id === p.userId),
        })),
        participants: input.participants.map(p => ({
          user_id: p.userId,
          share_amount_paise: p.shareAmountPaise,
          raw_share_value: p.rawShareValue,
          is_excluded: p.isExcluded,
          profile: DEMO_USERS.find(u => u.id === p.userId),
        })),
      };

      setExpenses(prev => [newExpense, ...prev]);

      // Add notification for other participants
      input.participants.forEach(p => {
        if (!p.isExcluded && p.userId !== creatorId) {
          const newNotif: AppNotification = {
            id: `notif_${Date.now()}_${p.userId}`,
            user_id: p.userId,
            title: `New Expense Added: ${input.title}`,
            message: `You were included in an expense of ₹${(input.amountPaise / 100).toFixed(0)}.`,
            link_url: `/groups/${input.groupId}`,
            is_read: false,
            created_at: new Date().toISOString(),
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      });

      return newExpense;
    }

    // Supabase creation
    const { data: expData, error: expErr } = await supabase
      .from('expenses')
      .insert({
        id: newExpenseId,
        group_id: input.groupId,
        title: input.title,
        description: input.description,
        amount_paise: input.amountPaise,
        category: input.category,
        expense_date: input.expenseDate,
        split_type: input.splitType,
        created_by: creatorId,
      })
      .select()
      .single();

    if (expErr) throw expErr;

    // Insert payers
    await supabase.from('expense_payers').insert(
      input.payers.map(p => ({
        expense_id: newExpenseId,
        user_id: p.userId,
        amount_paid_paise: p.amountPaidPaise,
      }))
    );

    // Insert participants
    await supabase.from('expense_participants').insert(
      input.participants.map(p => ({
        expense_id: newExpenseId,
        user_id: p.userId,
        share_amount_paise: p.shareAmountPaise,
        raw_share_value: p.rawShareValue,
        is_excluded: p.isExcluded,
      }))
    );

    await loadSupabaseData();
    return expData as unknown as Expense;
  };

  const editExpense = async (expenseId: string, input: AddExpenseInput) => {
    if (isDemoMode) {
      setExpenses(prev =>
        prev.map(exp => {
          if (exp.id !== expenseId) return exp;
          return {
            ...exp,
            title: input.title,
            description: input.description,
            amount_paise: input.amountPaise,
            category: input.category,
            expense_date: input.expenseDate,
            split_type: input.splitType,
            updated_at: new Date().toISOString(),
            payers: input.payers.map(p => ({
              user_id: p.userId,
              amount_paid_paise: p.amountPaidPaise,
              profile: DEMO_USERS.find(u => u.id === p.userId),
            })),
            participants: input.participants.map(p => ({
              user_id: p.userId,
              share_amount_paise: p.shareAmountPaise,
              raw_share_value: p.rawShareValue,
              is_excluded: p.isExcluded,
              profile: DEMO_USERS.find(u => u.id === p.userId),
            })),
          };
        })
      );
      return;
    }

    // Supabase edit
    await supabase.from('expenses').update({
      title: input.title,
      description: input.description,
      amount_paise: input.amountPaise,
      category: input.category,
      expense_date: input.expenseDate,
      split_type: input.splitType,
      updated_at: new Date().toISOString(),
    }).eq('id', expenseId);

    // Refresh payers & participants
    await supabase.from('expense_payers').delete().eq('expense_id', expenseId);
    await supabase.from('expense_payers').insert(
      input.payers.map(p => ({
        expense_id: expenseId,
        user_id: p.userId,
        amount_paid_paise: p.amountPaidPaise,
      }))
    );

    await supabase.from('expense_participants').delete().eq('expense_id', expenseId);
    await supabase.from('expense_participants').insert(
      input.participants.map(p => ({
        expense_id: expenseId,
        user_id: p.userId,
        share_amount_paise: p.shareAmountPaise,
        raw_share_value: p.rawShareValue,
        is_excluded: p.isExcluded,
      }))
    );

    await loadSupabaseData();
  };

  const deleteExpense = async (expenseId: string) => {
    if (isDemoMode) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      return;
    }
    // Soft delete
    await supabase.from('expenses').update({ is_deleted: true }).eq('id', expenseId);
    await loadSupabaseData();
  };

  const recordSettlement = async (
    groupId: string,
    payerId: string,
    receiverId: string,
    amountPaise: number,
    notes?: string
  ): Promise<Settlement> => {
    const creatorId = user?.id || 'demo-user';
    const newSettlementId = isDemoMode ? `stl_${Date.now()}` : crypto.randomUUID();

    if (isDemoMode) {
      const payerProf = DEMO_USERS.find(u => u.id === payerId);
      const receiverProf = DEMO_USERS.find(u => u.id === receiverId);

      const newSettlement: Settlement = {
        id: newSettlementId,
        group_id: groupId,
        payer_id: payerId,
        receiver_id: receiverId,
        amount_paise: amountPaise,
        notes: notes || 'Settled up',
        status: 'RECORDED',
        created_by: creatorId,
        settled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payer_profile: payerProf,
        receiver_profile: receiverProf,
      };

      setSettlements(prev => [newSettlement, ...prev]);

      // Add notification for receiver
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        user_id: receiverId,
        title: 'Hisaab Settle Hua! 🎉',
        message: `${payerProf?.full_name || 'Someone'} sent ₹${(amountPaise / 100).toFixed(0)} to settle up.`,
        link_url: `/groups/${groupId}`,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [notif, ...prev]);

      return newSettlement;
    }

    // Call atomic Supabase RPC function
    const { data, error } = await supabase.rpc('record_atomic_settlement', {
      p_group_id: groupId,
      p_payer_id: payerId,
      p_receiver_id: receiverId,
      p_amount_paise: amountPaise,
      p_notes: notes || null,
    });

    if (error) throw error;
    await loadSupabaseData();

    return {
      id: data,
      group_id: groupId,
      payer_id: payerId,
      receiver_id: receiverId,
      amount_paise: amountPaise,
      status: 'RECORDED',
      created_by: creatorId,
      settled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const reverseSettlement = async (settlementId: string) => {
    if (isDemoMode) {
      setSettlements(prev =>
        prev.map(s => (s.id === settlementId ? { ...s, status: 'REVERSED' as const } : s))
      );
      return;
    }
    await supabase.from('settlements').update({ status: 'REVERSED' }).eq('id', settlementId);
    await loadSupabaseData();
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    if (!isDemoMode && isSupabaseConfigured()) {
      supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
  };

  const getGroupBalancesForGroup = (groupId: string): GroupBalances[] => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.members) return [];

    const groupExpenses = expenses.filter(e => e.group_id === groupId);
    const groupSettlements = settlements.filter(s => s.group_id === groupId && s.status !== 'REVERSED');

    return calculateGroupBalances(group.members, groupExpenses, groupSettlements);
  };

  const getGroupTransfersForGroup = (groupId: string): SuggestedTransfer[] => {
    const balances = getGroupBalancesForGroup(groupId);
    return simplifyDebts(balances);
  };

  const getPersonalBalanceSummary = (userId: string) => {
    let totalYouOwePaise = 0;
    let totalYouAreOwedPaise = 0;
    let unsettledCount = 0;

    groups.forEach(g => {
      const isMember = g.members?.some(m => m.user_id === userId);
      if (isMember) {
        const balances = getGroupBalancesForGroup(g.id);
        const myBal = balances.find(b => b.userId === userId);
        if (myBal) {
          if (myBal.netBalancePaise > 0) {
            totalYouAreOwedPaise += myBal.netBalancePaise;
            unsettledCount++;
          } else if (myBal.netBalancePaise < 0) {
            totalYouOwePaise += Math.abs(myBal.netBalancePaise);
            unsettledCount++;
          }
        }
      }
    });

    const netBalancePaise = totalYouAreOwedPaise - totalYouOwePaise;
    return {
      totalYouOwePaise,
      totalYouAreOwedPaise,
      netBalancePaise,
      unsettledCount,
    };
  };

  return (
    <DataContext.Provider
      value={{
        groups,
        expenses,
        settlements,
        notifications,
        isLoading,
        createGroup,
        addExpense,
        editExpense,
        deleteExpense,
        recordSettlement,
        reverseSettlement,
        markNotificationRead,
        getGroupBalancesForGroup,
        getGroupTransfersForGroup,
        getPersonalBalanceSummary,
        refreshData: loadSupabaseData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
