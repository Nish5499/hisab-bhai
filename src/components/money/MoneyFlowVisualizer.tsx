import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, UserX, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Expense, SuggestedTransfer } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { formatInr } from '../../lib/money/calculations';

interface MoneyFlowVisualizerProps {
  expense?: Expense;
  transfers?: SuggestedTransfer[];
  title?: string;
  onSettleTransfer?: (transfer: SuggestedTransfer) => void;
}

export const MoneyFlowVisualizer: React.FC<MoneyFlowVisualizerProps> = ({
  expense,
  transfers,
  title,
  onSettleTransfer,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(3); // 1 = payer, 2 = split flow, 3 = all balances
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const restartAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  // If visualizing a single expense flow
  if (expense) {
    const payers = expense.payers;
    const includedParticipants = expense.participants.filter(p => !p.is_excluded);
    const excludedParticipants = expense.participants.filter(p => p.is_excluded);

    return (
      <div className="bg-[#FFFDF0] border-3 border-black rounded-3xl p-5 md:p-6 shadow-neo-lg space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-black font-display tracking-tight text-black">
                {title || 'Paisa Flow Breakdown'}
              </h3>
            </div>
            <p className="text-xs font-semibold text-neutral-600 mt-0.5">
              Animated visualization of who paid & who owes what
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={restartAnimation}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-neo-sm inline-flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
              title="Replay animation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replay Flow
            </button>
            <Badge variant="yellow" size="sm">
              ₹{(expense.amount_paise / 100).toLocaleString('en-IN')} Total
            </Badge>
          </div>
        </div>

        {/* Visual Flow Area */}
        <div key={animationKey} className="relative space-y-6">
          {/* Step 1: The Payer(s) */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                1. Kisne Diya Paisa? (Who Paid)
              </span>
              <span className="text-xs font-bold text-[#22C55E] bg-green-50 px-2 py-0.5 rounded border border-green-300">
                Paid in Full
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {payers.map((payer, idx) => (
                <motion.div
                  key={payer.user_id}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-[#FFFBEA]"
                >
                  <Avatar name={payer.profile?.full_name || 'Payer'} url={payer.profile?.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm truncate">{payer.profile?.full_name || 'Member'}</p>
                    <p className="text-xs font-bold text-neutral-600">Payer</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-black">
                      {formatInr(payer.amount_paid_paise)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Step 2: Flow Arrows */}
          <div className="flex justify-center items-center py-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="px-4 py-1.5 rounded-full border-2 border-black bg-[#FFE600] font-black text-xs uppercase tracking-wider shadow-neo-sm flex items-center gap-1.5"
            >
              <span>Split ho raha hai</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Step 3: Included Participants & Their Shares */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-neo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                2. Tera Kitna Banta Hai? (Participant Shares)
              </span>
              <span className="text-xs font-bold text-neutral-600">
                {includedParticipants.length} people sharing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {includedParticipants.map((part, idx) => {
                const isPayer = payers.some(p => p.user_id === part.user_id);
                return (
                  <motion.div
                    key={part.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.15, duration: 0.35 }}
                    className="p-3.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={part.profile?.full_name || 'User'} url={part.profile?.avatar_url} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{part.profile?.full_name || 'Member'}</p>
                        {isPayer && (
                          <span className="text-[10px] font-black uppercase bg-[#FFE600] px-1.5 py-0.2 rounded border border-black">
                            Self Share
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-neutral-200">
                      <span className="text-xs text-neutral-500 font-semibold">Share:</span>
                      <span className="text-sm font-black text-black">
                        {formatInr(part.share_amount_paise)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Excluded Members Callout */}
          {excludedParticipants.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-[#F8F9FA] border-2 border-neutral-400 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2 text-neutral-700">
                <UserX className="w-4 h-4 text-neutral-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Excluded from this Expense (Zero Liability)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {excludedParticipants.map(exc => (
                  <div
                    key={exc.user_id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-neutral-400 bg-white"
                  >
                    <Avatar name={exc.profile?.full_name || 'User'} url={exc.profile?.avatar_url} size="sm" />
                    <span className="text-xs font-bold text-neutral-700">
                      {exc.profile?.full_name}
                    </span>
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      ₹0 (Not Included)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // If visualizing group-wide debt settlements
  if (transfers) {
    if (transfers.length === 0) {
      return (
        <div className="bg-[#F4FFE0] border-3 border-black rounded-3xl p-8 text-center shadow-neo">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#22C55E] border-2 border-black shadow-neo-sm flex items-center justify-center text-3xl">
            🎉
          </div>
          <h3 className="text-2xl font-black font-display text-black mb-1">
            Scene Sorted, Bhai!
          </h3>
          <p className="text-sm font-bold text-neutral-700 max-w-sm mx-auto">
            Zero pending debts in this group. Everyone is completely squared up!
          </p>
        </div>
      );
    }

    return (
      <div className="bg-[#FFFDF0] border-3 border-black rounded-3xl p-5 md:p-6 shadow-neo-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💸</span>
              <h3 className="text-xl font-black font-display tracking-tight text-black">
                {title || 'Optimal Settlement Transfers'}
              </h3>
            </div>
            <p className="text-xs font-semibold text-neutral-600 mt-0.5">
              Simplified greedy debt reduction algorithm (Fewest transfers to settle all accounts)
            </p>
          </div>
          <Badge variant="blue" size="sm">
            {transfers.length} Transfers Needed
          </Badge>
        </div>

        {/* Transfer Cards with Flow Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transfers.map((t, idx) => (
            <motion.div
              key={`${t.fromUserId}_${t.toUserId}_${idx}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="bg-white border-2 border-black rounded-2xl p-4 shadow-neo flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                {/* Debtor */}
                <div className="flex items-center gap-2.5">
                  <Avatar name={t.fromName} url={t.fromAvatar} size="md" />
                  <div>
                    <p className="font-black text-sm text-black">{t.fromName}</p>
                    <p className="text-[11px] font-bold text-neutral-500">Owes money</p>
                  </div>
                </div>

                {/* Animated Arrow + Amount in Badge */}
                <div className="flex flex-col items-center px-2">
                  <span className="text-xs font-black text-[#FF4D8D]">
                    {formatInr(t.amount_paise)}
                  </span>
                  <div className="flex items-center text-neutral-700 my-0.5">
                    <div className="w-6 h-0.5 bg-black" />
                    <ArrowRight className="w-4 h-4 -ml-1 text-black" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500">pays</span>
                </div>

                {/* Creditor */}
                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <p className="font-black text-sm text-black">{t.toName}</p>
                    <p className="text-[11px] font-bold text-[#22C55E]">Gets back</p>
                  </div>
                  <Avatar name={t.toName} url={t.toAvatar} size="md" />
                </div>
              </div>

              {/* UPI & Settle Button */}
              <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-neutral-600 truncate">
                  {t.toUpi ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                      UPI: {t.toUpi}
                    </span>
                  ) : (
                    <span>Cash / UPI</span>
                  )}
                </div>
                {onSettleTransfer && (
                  <button
                    onClick={() => onSettleTransfer(t)}
                    className="px-3 py-1.5 text-xs font-black rounded-xl border-2 border-black bg-[#22C55E] text-black hover:bg-[#16A34A] shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Settle This
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
