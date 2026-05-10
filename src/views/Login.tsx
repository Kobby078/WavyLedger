import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { LogIn, ShieldCheck, PieChart, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/app/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side: Branding & Features */}
      <div className="lg:w-1/2 bg-wavy-dark p-10 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-wavy-teal rounded-full blur-3xl opacity-5 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-wavy-lime rounded-full blur-3xl opacity-5 -ml-48 -mb-48" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <Logo dark />
          </div>

          <div className="space-y-12 max-w-md">
            <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
              Master your business finances with <span className="text-wavy-teal">precision.</span>
            </h2>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Multi-shop Management", desc: "Manage all your locations from a single powerful dashboard.", color: "text-wavy-teal" },
                { icon: PieChart, title: "Real-time Analytics", desc: "See your profits, expenses, and growth metrics as they happen.", color: "text-wavy-lime" },
                { icon: Wallet, title: "Debt & Expense Tracker", desc: "Never lose track of what's owed with our integrated tools.", color: "text-wavy-teal" }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <feature.icon className={feature.color} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm flex gap-6">
          <p>© 2026 WavyLedger Inc.</p>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-wavy-teal/5 border border-slate-100"
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h3>
            <p className="text-slate-500">Sign in to manage your empire</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-wavy-teal transition-all shadow-sm group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
            <LogIn size={18} className="text-slate-400 group-hover:text-wavy-teal group-hover:translate-x-1 transition-all" />
          </button>

          <div className="mt-10 flex items-center gap-4 text-slate-300">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Trusted by SMBs globally</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="mt-10 text-center text-xs text-slate-400 leading-relaxed">
            By signing in, you agree to our Terms of Use and Privacy Policy. WavyLedger encrypts your sensitive financial data with industry protocols.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
