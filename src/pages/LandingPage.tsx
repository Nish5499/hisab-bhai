import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, PieChart, Users, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      {/* Hero Header */}
      <nav className="border-b-3 border-black bg-[#FFE600] px-4 py-3 shadow-neo">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🪙</span>
            <div>
              <span className="font-display font-black text-2xl tracking-tight">HisabBhai</span>
              <span className="text-[10px] font-bold block -mt-1 uppercase tracking-widest text-black/70">
                Bhai, hisaab clear kar!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="pink" size="sm">
                Open App <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border-2 border-black bg-[#FFF0F5] shadow-neo-sm font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
              <span>THE INDIAN EXPENSE SHARING APP</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-[1.08] text-black">
              Bhai, <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-black inline-block shadow-neo-sm">Hisaab Clear</span> Kar!
            </h1>

            <p className="text-base sm:text-lg font-bold text-neutral-700 max-w-xl leading-relaxed">
              No more awkward calculations after Goa trips, flat rent, or tapri chai.
              With instant paise precision, excluded member splits, and animated money flows.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="text-base sm:text-lg">
                  Instant Demo Mode ⚡
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="blue" size="lg" className="text-base sm:text-lg">
                  Create Free Account
                </Button>
              </Link>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-bold text-neutral-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Integer Paise Precision
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Excluded Members Support
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Greedy Debt Reduction
              </span>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFE600] border-3 border-black rounded-3xl p-6 shadow-neo-xl transform lg:rotate-1 hover:rotate-0 transition-transform">
              <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍛</span>
                    <div>
                      <p className="font-black text-sm">Biryani Night at Behrouz</p>
                      <p className="text-[11px] font-bold text-neutral-500">Flat 402 Bantai</p>
                    </div>
                  </div>
                  <Badge variant="pink" size="sm">₹1,500</Badge>
                </div>

                <div className="space-y-2 text-xs font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDF0] border border-black">
                    <span>Rahul (Paid ₹1,500)</span>
                    <span className="text-[#22C55E]">+₹1,000 net</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-300">
                    <span>Priya (Share ₹500)</span>
                    <span className="text-[#FF4D8D]">-₹500 owes</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-300">
                    <span>Amit (Share ₹500)</span>
                    <span className="text-[#FF4D8D]">-₹500 owes</span>
                  </div>
                  {/* Excluded feature demonstration */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-400 opacity-80">
                    <span>Neha (Out of town)</span>
                    <span className="text-neutral-500">₹0 (Excluded)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-[#F4FFE0] rounded-xl border-2 border-black text-center font-black text-xs">
                    ⚡ 1 Transfer Settles Everything!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-neo hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-black shadow-neo-sm flex items-center justify-center text-2xl mb-4">
              🎯
            </div>
            <h2 className="text-xl font-black font-display mb-2">Excluded Members</h2>
            <p className="text-sm font-semibold text-neutral-600">
              Neha didn’t eat biryani? Amit left before dinner? Mark them as excluded with one tap and they get zero liability.
            </p>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-neo hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FF4D8D] border-2 border-black shadow-neo-sm flex items-center justify-center text-2xl mb-4 text-white">
              ⚡
            </div>
            <h2 className="text-xl font-black font-display mb-2">Animated Paisa Flow</h2>
            <p className="text-sm font-semibold text-neutral-600">
              Interactive node graph that animates who paid, who owes whom, and generates the exact minimum UPI transfers.
            </p>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-neo hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#2B59FF] border-2 border-black shadow-neo-sm flex items-center justify-center text-2xl mb-4 text-white">
              🛡️
            </div>
            <h2 className="text-xl font-black font-display mb-2">Zero Paise Leakage</h2>
            <p className="text-sm font-semibold text-neutral-600">
              Exact integer arithmetic in paise. Split ₹100 three ways? 33.34, 33.33, 33.33. No rounding errors ever.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-black bg-white py-8 px-4 mt-20 text-center font-bold text-xs text-neutral-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 HisabBhai. Made for Indian roommates, trips & tapris.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-black underline">Login</Link>
            <Link to="/signup" className="hover:text-black underline">Sign Up</Link>
            <Link to="/dashboard" className="hover:text-black underline">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
