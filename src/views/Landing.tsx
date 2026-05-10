import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  LayoutDashboard, 
  Plus, 
  BarChart3, 
  Zap, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-wavy-teal rotate-45 rounded-lg opacity-20 animate-pulse"></div>
      <div className="relative z-10 w-8 h-8 bg-wavy-dark rounded-xl flex items-center justify-center border-2 border-wavy-teal/50 shadow-lg shadow-wavy-teal/20">
        <div className="text-wavy-teal font-black text-xl italic select-none">W</div>
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-wavy-lime rounded-full blur-[1px]"></div>
    </div>
    <span className="text-2xl font-black text-slate-900 tracking-tighter flex items-baseline">
      Wavy<span className="text-wavy-teal">Ledger</span>
    </span>
  </div>
);

export default function Landing() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const features = [
    {
      title: "Multi-Shop Management",
      description: "Manage multiple retail locations, inventory, and staff from a central, secure platform.",
      icon: Store,
      color: "bg-wavy-teal/10 text-wavy-teal"
    },
    {
      title: "Real-time Analytics",
      description: "Watch your business grow with live sales data, profit summaries, and detailed financial reports.",
      icon: BarChart3,
      color: "bg-wavy-lime/10 text-wavy-lime"
    },
    {
      title: "Category-First Inventory",
      description: "Keep your stocks organized with custom categories, low-stock alerts, and batch exports.",
      icon: Zap,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Global Compatibility",
      description: "Support for multiple currencies (GHS, USD, NGN, etc.) and intelligent location services.",
      icon: Globe,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Secure & Distributed",
      description: "Industry-standard encryption ensures your business data is always safe and accessible.",
      icon: ShieldCheck,
      color: "bg-wavy-teal/10 text-wavy-teal"
    },
    {
      title: "Mobile Optimized",
      description: "A fully responsive experience that stays with you, from warehouse to storefront.",
      icon: Smartphone,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-slate-50 min-h-screen selection:bg-wavy-teal/20 font-sans">
      {/* Navigation */}
      <nav className="container mx-auto h-24 flex items-center justify-between px-6 border-b border-slate-200">
        <Logo />
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-wavy-teal transition-colors">Sign In</Link>
          <Link 
            to="/login" 
            className="bg-wavy-dark text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-wavy-teal/10 hover:bg-slate-800 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-32 text-center relative overflow-hidden">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-wavy-teal/10 text-wavy-teal px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-wavy-teal/20"
          >
            <Zap size={14} className="text-wavy-lime" /> The Next gen of Business Management
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 max-w-4xl mx-auto"
          >
            Manage Your Entire <span className="text-transparent bg-clip-text bg-gradient-to-r from-wavy-teal to-wavy-lime">Business</span> With Zero Hassle.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12"
          >
            WavyLedger is the ultimate multi-shop management tool for modern SMBs. Track sales, inventory, and expenses across all locations in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-wavy-dark text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-wavy-teal/20 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all hover:translate-y-[-2px] active:scale-95"
            >
              Start Free Trial <ArrowRight size={20} className="text-wavy-lime" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wavy-teal/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wavy-lime/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-32 bg-white rounded-[4rem] shadow-2xl shadow-slate-100 flex flex-col items-center">
        <div className="text-center mb-20 text-balance">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Built for Serious Scaling</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything you need to move from a single storefront to a nationwide enterprise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-wavy-teal/10 hover:border-wavy-teal/30 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-6 py-32">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-wavy-teal/10 text-wavy-teal px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-wavy-teal/20">
              Contact Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Questions? We have <span className="text-wavy-teal">waves</span> of answers.</h2>
            <p className="text-slate-500 text-lg">Our dedicated support team is here to help you ride the Wave of success. Reach out anytime.</p>
            
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-wavy-teal group-hover:bg-wavy-teal group-hover:text-white transition-all shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Email Us</p>
                  <p className="text-slate-900 font-bold">hello@wavyledger.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-wavy-lime group-hover:bg-wavy-lime group-hover:text-wavy-dark transition-all shadow-sm font-black">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Call Us</p>
                  <p className="text-slate-900 font-bold">+1 (555) WAVY-LEDG</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Our Office</p>
                  <p className="text-slate-900 font-bold">123 Commerce Avenue, Digital Harbor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-100 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-500">We'll get back to you within 24 hours.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 text-wavy-teal font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleContactSubmit} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Your Name"
                          className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-wavy-teal/20 focus:border-wavy-teal transition-all font-medium"
                          value={contactForm.name}
                          onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="your@email.com"
                          className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-wavy-teal/20 focus:border-wavy-teal transition-all font-medium"
                          value={contactForm.email}
                          onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Message</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="How can we help your business?"
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-wavy-teal/20 focus:border-wavy-teal transition-all font-medium resize-none"
                        value={contactForm.message}
                        onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-wavy-dark text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-wavy-teal/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      Send Message <MessageSquare size={20} className="text-wavy-lime" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              
              {/* Background accent */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-wavy-lime/5 rounded-full blur-3xl pointer-events-none"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-32 text-center">
        <div className="bg-wavy-dark rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 italic">Ready to ride the wave?</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">Join 5,000+ businesses globally using WavyLedger to run their daily operations smoother than ever.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 bg-white text-wavy-dark px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Create Your Account <Plus size={24} className="text-wavy-teal" />
            </Link>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-12 text-wavy-teal/10 -z-0">
            <Store size={300} />
          </div>
          <div className="absolute bottom-0 left-0 p-12 text-wavy-lime/5 -z-0">
            <LayoutDashboard size={300} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-200">
          <Logo className="opacity-80 scale-90" />
          <p className="text-slate-400 text-sm font-medium">© 2026 WavyLedger. Built with precision for modern commerce.</p>
          <div className="flex items-center gap-8 text-sm font-bold text-slate-400 transition-colors">
            <a href="#contact" className="hover:text-slate-900">Contact</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
