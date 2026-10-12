import { SplitMethod, SuggestedTransfer, GroupBalances, Expense, Settlement, UserProfile } from '../../types';

/**
 * Format integer paise into Indian Rupee string (₹)
 * Uses Indian numbering system (Lakhs, Crores) e.g. ₹1,50,000.00
 */
export function formatInr(paise: number, options: { showSign?: boolean; hidePaiseIfZero?: boolean } = {}): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  const hasDecimal = absPaise % 100 !== 0;
  const minimumFractionDigits = options.hidePaiseIfZero && !hasDecimal ? 0 : 2;
  const maximumFractionDigits = 2;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rupees);

  if (options.showSign && paise > 0) {
    return `+${formatted}`;
  }
  if (isNegative) {
    return `-${formatted}`;
  }
  return formatted;
}

/**
 * Convert rupee decimal input (e.g. "150.50") safely to integer paise (15050)
 */
export function rupeesToPaise(rupeesInput: number | string): number {
  if (typeof rupeesInput === 'string') {
    rupeesInput = parseFloat(rupeesInput.replace(/,/g, '').trim()) || 0;
  }
  return Math.round(rupeesInput * 100);
}

/**
 * Convert integer paise to decimal rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export interface ParticipantShareInput {
  userId: string;
  isExcluded: boolean;
  rawValue?: number; // percentage, exact paise, or share units
}

/**
 * Authoritative split calculator with zero-leak residual paise allocation.
 * Guarantees that sum(shares) === totalAmountPaise exactly!
 * Excluded members receive 0 paise liability.
 */
export function calculateSplitShares(
  totalAmountPaise: number,
  participants: ParticipantShareInput[],
  splitType: SplitMethod
): { userId: string; sharePaise: number; isExcluded: boolean }[] {
  if (totalAmountPaise <= 0) {
    return participants.map(p => ({ userId: p.userId, sharePaise: 0, isExcluded: p.isExcluded }));
  }

  const activeParticipants = participants.filter(p => !p.isExcluded);

  if (activeParticipants.length === 0) {
    throw new Error('At least one participant must be included in the expense');
  }

  const result: { userId: string; sharePaise: number; isExcluded: boolean }[] = [];
  const activeShares: { userId: string; sharePaise: number }[] = [];

  switch (splitType) {
    case 'EQUAL': {
      const count = activeParticipants.length;
      const baseShare = Math.floor(totalAmountPaise / count);
      const remainder = totalAmountPaise % count; // Remainder in paise to distribute deterministically

      activeParticipants.forEach((p, index) => {
        // First 'remainder' participants take 1 extra paise
        const extra = index < remainder ? 1 : 0;
        activeShares.push({
          userId: p.userId,
          sharePaise: baseShare + extra,
        });
      });
      break;
    }

    case 'EXACT': {
      let allocatedTotal = 0;
      activeParticipants.forEach(p => {
        const share = Math.round(p.rawValue || 0);
        allocatedTotal += share;
        activeShares.push({ userId: p.userId, sharePaise: share });
      });

      if (allocatedTotal !== totalAmountPaise) {
        throw new Error(
          `Exact shares sum (₹${allocatedTotal / 100}) must equal total expense amount (₹${totalAmountPaise / 100})`
        );
      }
      break;
    }

    case 'PERCENTAGE': {
      const totalPct = activeParticipants.reduce((sum, p) => sum + (p.rawValue || 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        throw new Error(`Percentages must sum to 100% (current sum: ${totalPct}%)`);
      }

      let sumAllocated = 0;
      const tempShares: { userId: string; sharePaise: number; remainderRank: number }[] = [];

      activeParticipants.forEach(p => {
        const pct = p.rawValue || 0;
        const exactPaise = (totalAmountPaise * pct) / 100;
        const floorPaise = Math.floor(exactPaise);
        sumAllocated += floorPaise;
        tempShares.push({
          userId: p.userId,
          sharePaise: floorPaise,
          remainderRank: exactPaise - floorPaise,
        });
      });

      // Distribute residual paise according to largest fractional remainder
      let remainingPaise = totalAmountPaise - sumAllocated;
      tempShares.sort((a, b) => b.remainderRank - a.remainderRank);

      for (let i = 0; i < tempShares.length; i++) {
        if (remainingPaise > 0) {
          tempShares[i].sharePaise += 1;
          remainingPaise--;
        }
      }

      tempShares.forEach(s => {
        activeShares.push({ userId: s.userId, sharePaise: s.sharePaise });
      });
      break;
    }

    case 'SHARES': {
      const totalUnits = activeParticipants.reduce((sum, p) => sum + Math.max(0, p.rawValue || 1), 0);
      if (totalUnits <= 0) {
        throw new Error('Total shares must be greater than zero');
      }

      let sumAllocated = 0;
      const tempShares: { userId: string; sharePaise: number; remainderRank: number }[] = [];

      activeParticipants.forEach(p => {
        const units = Math.max(0, p.rawValue || 1);
        const exactPaise = (totalAmountPaise * units) / totalUnits;
        const floorPaise = Math.floor(exactPaise);
        sumAllocated += floorPaise;
        tempShares.push({
          userId: p.userId,
          sharePaise: floorPaise,
          remainderRank: exactPaise - floorPaise,
        });
      });

      let remainingPaise = totalAmountPaise - sumAllocated;
      tempShares.sort((a, b) => b.remainderRank - a.remainderRank);

      for (let i = 0; i < tempShares.length; i++) {
        if (remainingPaise > 0) {
          tempShares[i].sharePaise += 1;
          remainingPaise--;
        }
      }

      tempShares.forEach(s => {
        activeShares.push({ userId: s.userId, sharePaise: s.sharePaise });
      });
      break;
    }
  }

  // Combine active participants with excluded participants (0 paise)
  participants.forEach(p => {
    if (p.isExcluded) {
      result.push({ userId: p.userId, sharePaise: 0, isExcluded: true });
    } else {
      const matched = activeShares.find(s => s.userId === p.userId);
      result.push({
        userId: p.userId,
        sharePaise: matched ? matched.sharePaise : 0,
        isExcluded: false,
      });
    }
  });

  return result;
}

/**
 * Compute Group Balances from expenses and settlements
 */
export function calculateGroupBalances(
  members: { user_id: string; profile?: UserProfile }[],
  expenses: Expense[],
  settlements: Settlement[]
): GroupBalances[] {
  const memberMap = new Map<string, { totalPaid: number; totalOwed: number; netSettled: number }>();

  members.forEach(m => {
    memberMap.set(m.user_id, { totalPaid: 0, totalOwed: 0, netSettled: 0 });
  });

  // 1. Process Expenses
  expenses.forEach(exp => {
    // Payers: add to totalPaid
    exp.payers.forEach(payer => {
      const record = memberMap.get(payer.user_id);
      if (record) {
        record.totalPaid += payer.amount_paid_paise;
      }
    });

    // Participants: add to totalOwed if not excluded
    exp.participants.forEach(participant => {
      if (!participant.is_excluded && participant.share_amount_paise > 0) {
        const record = memberMap.get(participant.user_id);
        if (record) {
          record.totalOwed += participant.share_amount_paise;
        }
      }
    });
  });

  // 2. Process Settlements (status: RECORDED or CONFIRMED)
  settlements.forEach(settlement => {
    if (settlement.status !== 'REVERSED') {
      const payerRecord = memberMap.get(settlement.payer_id);
      const receiverRecord = memberMap.get(settlement.receiver_id);

      if (payerRecord) {
        // Payer paid settlement money -> increases their net balance
        payerRecord.netSettled += settlement.amount_paise;
      }
      if (receiverRecord) {
        // Receiver received settlement money -> decreases their net balance
        receiverRecord.netSettled -= settlement.amount_paise;
      }
    }
  });

  // 3. Assemble resulting balances
  const balances: GroupBalances[] = [];

  members.forEach(m => {
    const data = memberMap.get(m.user_id) || { totalPaid: 0, totalOwed: 0, netSettled: 0 };
    const netBalancePaise = (data.totalPaid - data.totalOwed) + data.netSettled;

    balances.push({
      userId: m.user_id,
      userName: m.profile?.full_name || 'Group Member',
      userAvatar: m.profile?.avatar_url,
      userUpi: m.profile?.upi_id,
      totalPaidPaise: data.totalPaid,
      totalOwedPaise: data.totalOwed,
      netBalancePaise,
    });
  });

  return balances;
}

/**
 * Deterministic Debt Simplification Algorithm
 * Greedy debtor-creditor matching algorithm in exact integer paise.
 * Simplifies group debts down to minimal set of transfers.
 */
export function simplifyDebts(balances: GroupBalances[]): SuggestedTransfer[] {
  interface Node {
    userId: string;
    userName: string;
    userAvatar?: string;
    userUpi?: string;
    balance: number; // in paise
  }

  const debtors: Node[] = [];
  const creditors: Node[] = [];

  balances.forEach(b => {
    if (b.netBalancePaise < 0) {
      debtors.push({
        userId: b.userId,
        userName: b.userName,
        userAvatar: b.userAvatar,
        userUpi: b.userUpi,
        balance: -b.netBalancePaise, // positive debt amount
      });
    } else if (b.netBalancePaise > 0) {
      creditors.push({
        userId: b.userId,
        userName: b.userName,
        userAvatar: b.userAvatar,
        userUpi: b.userUpi,
        balance: b.netBalancePaise, // positive credit amount
      });
    }
  });

  // Sort descending by amount for greedy matching
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transfers: SuggestedTransfer[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0) {
      transfers.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        fromName: debtor.userName,
        toName: creditor.userName,
        fromAvatar: debtor.userAvatar,
        toAvatar: creditor.userAvatar,
        fromUpi: debtor.userUpi,
        toUpi: creditor.userUpi,
        amount_paise: amount,
      });

      debtor.balance -= amount;
      creditor.balance -= amount;
    }

    if (debtor.balance === 0) {
      dIdx++;
    }
    if (creditor.balance === 0) {
      cIdx++;
    }
  }

  return transfers;
}
