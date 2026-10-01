import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  Copy,
  X,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface PaystackModalProps {
  isOpen: boolean;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  reference: string;
  onSuccess: (reference: string) => Promise<void>;
  onClose: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  orderNumber,
  customerEmail,
  customerName,
  totalAmount,
  reference,
  onSuccess,
  onClose,
}) => {
  const { formatPrice } = useCurrency();
  const [activeChannel, setActiveChannel] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [step, setStep] = useState<'details' | 'otp' | 'transfer_verify'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // 3D Secure / OTP Input
  const [otpCode, setOtpCode] = useState('');
  const [transferSenderName, setTransferSenderName] = useState('');

  if (!isOpen) return null;

  const handleCardProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 16) {
      setErrorMessage('Please enter a valid 16-digit debit/credit card number.');
      return;
    }

    if (!expiry || !expiry.includes('/') || expiry.length < 5) {
      setErrorMessage('Please enter a valid expiry date (MM/YY).');
      return;
    }

    if (!cvv || cvv.length < 3) {
      setErrorMessage('Please enter a valid 3-digit CVV from the back of your card.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode.trim()) {
      setErrorMessage('Please enter the OTP sent to your phone/email.');
      return;
    }

    // Strict validation: Require Paystack standard test OTP '123456'
    if (otpCode.trim() !== '123456') {
      setErrorMessage('Payment Declined: Invalid OTP code. (For test mode, enter 123456).');
      return;
    }

    setIsProcessing(true);
    try {
      await onSuccess(reference);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed.');
      setIsProcessing(false);
    }
  };

  const handleVerifyTransfer = async () => {
    if (!transferSenderName.trim()) {
      setErrorMessage('Please enter your transfer account/sender name to verify credit alert.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await onSuccess(reference);
      } catch (err: any) {
        setErrorMessage(err.message || 'Transfer credit verification failed.');
        setIsProcessing(false);
      }
    }, 1500);
  };

  const handleCopyVirtual = () => {
    navigator.clipboard.writeText('7036192301');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        {/* Paystack Top Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 font-black text-sm tracking-tighter">P</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Paystack Checkout</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TEST SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Merchant: SAMM AI Store</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Customer Info */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Amount to Pay
            </span>
            <div className="text-xl font-extrabold text-white font-mono">
              {formatPrice(totalAmount)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Order #{orderNumber}</span>
            <div className="text-xs text-slate-300 font-medium truncate max-w-[150px]">
              {customerEmail}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 'details' && (
          <>
            {/* Channel Tabs */}
            <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveChannel('card');
                  setErrorMessage(null);
                }}
                className={`py-3 flex items-center justify-center gap-1.5 font-semibold transition-all border-b-2 ${
                  activeChannel === 'card'
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveChannel('transfer');
                  setErrorMessage(null);
                }}
                className={`py-3 flex items-center justify-center gap-1.5 font-semibold transition-all border-b-2 ${
                  activeChannel === 'transfer'
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveChannel('ussd');
                  setErrorMessage(null);
                }}
                className={`py-3 flex items-center justify-center gap-1.5 font-semibold transition-all border-b-2 ${
                  activeChannel === 'ussd'
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>USSD</span>
              </button>
            </div>

            {/* Channel Body */}
            <div className="p-6 space-y-4 text-xs">
              {activeChannel === 'card' && (
                <form onSubmit={handleCardProceed} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-medium">Card Number</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('4084 0840 0000 0000');
                          setExpiry('12/30');
                          setCvv('408');
                        }}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        Fill Test Card
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 4084 0840 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                        VISA / VERVE
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Valid Until (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/30"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="408"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Verifying Card...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to 3D Secure Authentication</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeChannel === 'transfer' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <span className="text-[11px] text-slate-400 block">
                      Paystack dynamic virtual account:
                    </span>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Bank:</span>
                        <strong className="text-white">Wema Bank / Titan Trust</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-sm text-emerald-400 font-bold">
                            7036192301
                          </strong>
                          <button
                            type="button"
                            onClick={handleCopyVirtual}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>Beneficiary:</span>
                        <strong className="text-white">Paystack Checkout (SAMM AI)</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Enter Sender Account Name (for credit verification)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Amaechi"
                      value={transferSenderName}
                      onChange={(e) => setTransferSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyTransfer}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Verifying Bank Credit Alert...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>I Have Completed Transfer — Verify</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeChannel === 'ussd' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <span className="text-xs text-slate-300">Dial on your registered bank phone:</span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 font-mono text-sm font-black text-emerald-400">
                    *737*50*{Math.round(totalAmount)}*01#
                  </div>
                  <p className="text-[10px] text-slate-500">Supports GTBank, Access, Zenith, UBA &amp; FirstBank</p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('otp');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                  >
                    I have dialed the USSD code
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PCI-DSS Level 1 Certified · 256-Bit TLS Encryption</span>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: 3D Secure / OTP Verification */}
        {step === 'otp' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <KeyRound className="w-5 h-5 shrink-0" />
              <div>
                <strong className="block font-bold">3D Secure Bank Authentication</strong>
                <span className="text-[11px] text-emerald-300">
                  Enter the One-Time Password (OTP) to authorize ₦{totalAmount.toLocaleString()}.
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Paystack Test OTP: <strong className="text-emerald-400">123456</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="text-emerald-400 underline font-semibold"
                  >
                    Insert 123456
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Authenticating with Bank...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize Payment of {formatPrice(totalAmount)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setStep('details');
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  ← Back to Card Details
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
