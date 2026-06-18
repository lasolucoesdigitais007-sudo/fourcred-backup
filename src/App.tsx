import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';

function Navigation() {
  const location = useLocation();
  const isForm = location.pathname === '/';
  
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-4 border-b border-[#334155] bg-[#1E293B] gap-4">
      <div className="flex items-center gap-3 w-full justify-center md:w-auto md:justify-start">
        <div className="w-10 h-10 bg-[#FF6B1A] rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(255,107,26,0.3)] shrink-0 text-white">4C</div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">FOURCRED<span className="text-[#FF6B1A] font-bold text-2xl leading-none">$$</span></h1>
          <p className="text-[10px] text-[#CBD5E1] uppercase tracking-[0.2em] font-semibold mt-0.5">Financiamento Imobiliário</p>
        </div>
      </div>
      <nav className="flex gap-6 sm:gap-8 text-sm font-semibold w-full justify-center md:w-auto md:justify-start overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        <Link to="/" className={isForm ? "text-[#FF6B1A] whitespace-nowrap" : "text-[#CBD5E1] hover:text-white transition-colors whitespace-nowrap"}>
          Formulários
        </Link>
        <Link to="/admin" className={!isForm ? "text-[#FF6B1A] whitespace-nowrap" : "text-[#CBD5E1] hover:text-white transition-colors whitespace-nowrap"}>
          Dashboard
        </Link>
      </nav>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-white">LA Soluções</p>
          <p className="text-[10px] text-[#CBD5E1] font-semibold">Admin Gestor</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B1A] to-[#E85D04] shadow-md border border-[#334155]"></div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="px-4 sm:px-8 py-6 sm:py-4 bg-[#0F172A] border-t border-[#334155] flex flex-col sm:flex-row justify-between items-center mt-auto gap-4">
      <p className="text-[11px] text-[#CBD5E1] uppercase tracking-wider font-semibold text-center sm:text-left">© 2024 Fourcred Financeira — Gestão de Ativos</p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 bg-[#1E293B] px-3 py-1.5 rounded-full border border-[#334155]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase inline">Sistema Operacional</span>
        </div>
        <span className="text-[11px] text-[#CBD5E1]/50 font-medium hidden sm:inline">MVP v2.0 - Fintech UI</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans flex flex-col">
        <Navigation />
        <main className="flex-1 w-full bg-[#0F172A]">
          <Routes>
            <Route path="/" element={<ClientForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

