import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SuggestedTransfer } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { formatInr, rupeesToPaise } from '../../lib/money/calculations';
import { useData } from '../../features/data/DataContext';
import { QrCode, CheckCircle2, ArrowRight } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: SuggestedTransfer | null;
  groupId: string;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  transfer,
  groupId,
}) => {
  const { recordSettlement } = useData();
  const [customAmountRupees, setCustomAmountRupees] = useState<string>('');
  const [notes, setNotes] = useState<string>('Paid via UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!transfer) return null;

  const defaultRupees = (transfer.amount_paise / 100).toString();
  const currentAmountPaise = customAmountRupees
    ? rupeesToPaise(customAmountRupees)
    : transfer.amount_paise;

  const handleSettle = async () => {
    setIsSubmitting(true);
    try {
      await recordSettlement(
        groupId,
        transfer.fromUserId,
        transfer.toUserId,
        currentAmountPaise,
        notes
      );

      // Trigger Confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setCustomAmountRupees('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to settle debt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDone ? 'Scene Sorted! 🎉' : 'Hisaab Settle Karo'}
      maxWidth="md"
    >
      {isDone ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#22C55E] border-3 border-black flex items-center justify-center shadow-neo">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-2xl font-black font-display text-black">
            Bhai, Payment Recorded!
          </h3>
          <p className="text-sm font-bold text-neutral-600">
            Balances have been dynamically updated for everyone.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Visual Transfer summary */}
          <div className="flex items-center justify-between p-4 bg-[#FFFDF0] rounded-2xl border-2 border-black shadow-neo-sm">
            <div className="flex items-center gap-2">
              <Avatar name={transfer.fromName} url={transfer.fromAvatar} size="md" />
              <div>
                <p className="font-bold text-xs text-neutral-500">Payer</p>
                <p className="font-black text-sm">{transfer.fromName}</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-5 h-5 text-black" />
              <span className="text-[10px] font-bold text-neutral-500">pays</span>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="font-bold text-xs text-neutral-500">Receiver</p>
                <p className="font-black text-sm">{transfer.toName}</p>
              </div>
              <Avatar name={transfer.toName} url={transfer.toAvatar} size="md" />
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Settlement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-black text-black">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder={defaultRupees}
                value={customAmountRupees}
                onChange={e => setCustomAmountRupees(e.target.value)}
                className="neo-input pl-9 text-lg font-black"
              />
            </div>
            <p className="text-[11px] font-bold text-neutral-500 mt-1">
              Suggested outstanding amount: {formatInr(transfer.amount_paise)}
            </p>
          </div>

          {/* UPI details */}
          {transfer.toUpi && (
            <div className="p-3 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-neutral-600" />
                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-500">Pay directly via UPI</p>
                  <p className="text-xs font-mono font-bold text-black">{transfer.toUpi}</p>
                </div>
              </div>
              <a
                href={`upi://pay?pa=${transfer.toUpi}&pn=${encodeURIComponent(transfer.toName)}&am=${(currentAmountPaise / 100).toFixed(2)}&cu=INR`}
                className="px-2.5 py-1 text-xs font-bold bg-[#FFE600] border-2 border-black rounded-lg shadow-neo-sm hover:bg-[#FFED4A]"
              >
                Open UPI App
              </a>
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Paid via GPay / PhonePe / Cash"
              className="neo-input text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={handleSettle}
              isLoading={isSubmitting}
            >
              Confirm & Settle ({formatInr(currentAmountPaise)})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
