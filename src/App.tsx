import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Login from './views/Login';
import Home from './views/Home';
import Inventory from './views/Inventory';
import Sales from './views/Sales';
import Expenses from './views/Expenses';
import Debts from './views/Debts';
import Reports from './views/Reports';
import Shops from './views/Shops';
import Landing from './views/Landing';
import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-wavy-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default function App() {
  if (!hasValidKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-wavy-teal/10 rounded-3xl flex items-center justify-center text-wavy-teal mx-auto mb-8">
            <span className="text-3xl font-black italic">W</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Google Maps Key Required</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">To enable AI-powered location suggestions and address lookup, you need to provide a Google Maps Platform API key.</p>
          
          <div className="space-y-6 text-left mb-10">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-sm">1</div>
              <p className="text-slate-600 pt-1">
                <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-wavy-teal font-bold hover:underline">Get an API Key</a> from the Google Cloud Console.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-sm">2</div>
              <div className="text-slate-600 pt-1">
                Add your key as a secret in AI Studio:
                <ul className="mt-4 space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wavy-teal" />
                    Open <strong>Settings</strong> (⚙️ gear icon)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wavy-teal" />
                    Select <strong>Secrets</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-wavy-teal" />
                    Add <code>GOOGLE_MAPS_PLATFORM_KEY</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 bg-wavy-lime rounded-full animate-pulse" />
            App rebuilds automatically after setup
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <AppProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Home />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="debts" element={<Debts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="shops" element={<Shops />} />
          </Route>
          {/* Catch all to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
    </APIProvider>
  );
}
