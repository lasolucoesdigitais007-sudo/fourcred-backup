import React, { useEffect, useState } from 'react';
import { FormData } from '../types';
import { generatePDF } from '../lib/pdf';
import { Layers, RotateCw, Users, BadgeDollarSign, Activity, TrendingUp, Search, Download, FileText, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('fourcred_submissions') || '[]');
    // Sort descending by date
    data.sort((a: FormData, b: FormData) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setSubmissions(data);
  }, []);

  const handleDownload = (data: FormData) => {
    generatePDF(data);
  };

  const clearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os cadastros?')) {
      localStorage.removeItem('fourcred_submissions');
      setSubmissions([]);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter !== 'Todos') {
       // Mocking the filter logic as we don't have "status" property in the form yet.
       // We'll just show them all in this MVP.
    }
    if (searchTerm) {
      return (
        sub.p1.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.p1.cpf.includes(searchTerm) ||
        sub.id.includes(searchTerm)
      );
    }
    return true;
  });

  const totalVolume = submissions.reduce((acc, sub) => acc + Number(sub.financingValue || 0), 0);
  const avgTicket = submissions.length > 0 ? (totalVolume / submissions.length) : 0;
  
  const sacCount = submissions.filter(s => s.amortizationSystem === 'sac').length;
  const priceCount = submissions.filter(s => s.amortizationSystem === 'price').length;
  const indexAmortization = sacCount >= priceCount ? 'SAC' : 'PRICE';

  return (
    <div className="pb-12 px-4 sm:px-6 lg:px-8 bg-[#0F172A] min-h-full flex-1">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-8 rounded-2xl shadow-xl border border-[#334155]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#FF6B1A] text-white text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest shadow-[0_4px_12px_rgba(255,107,26,0.3)]">Mesa de Crédito — Área de Gestão</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Estúdio Fourcred de Operações</h1>
            <p className="text-sm text-[#CBD5E1] mt-2 font-medium">Controle de inscrições digitais e conversão em ficha física regulatória.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 md:mt-0 flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold text-[#CBD5E1] hover:text-white rounded-xl border border-[#334155] transition-all bg-[#0F172A] shadow-sm hover:bg-[#334155]"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar Inscrições
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-[#FF6B1A]/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest font-bold">Inscrições Totais</span>
               <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#CBD5E1] border border-[#334155] shadow-sm group-hover:bg-[#FF6B1A] group-hover:text-white group-hover:border-[#FF6B1A] transition-colors">
                  <Users className="w-5 h-5" />
               </div>
            </div>
            <div>
               <h2 className="text-4xl font-extrabold text-white">{submissions.length}</h2>
               <p className="text-[11px] text-[#FF6B1A] font-bold mt-2">{submissions.length > 0 ? '1 aguardando revisão' : 'Sem movimento'}</p>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-[#FF6B1A]/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest font-bold">Volume Total Financiado</span>
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <BadgeDollarSign className="w-5 h-5" />
               </div>
            </div>
            <div>
               <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  <span className="text-xl align-top mr-1 font-bold text-[#CBD5E1]/50">R$</span>
                  {totalVolume.toLocaleString('pt-BR')}
               </h2>
               <p className="text-[11px] text-emerald-400 font-bold mt-2">Propostas ativas na carteira</p>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-[#FF6B1A]/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest font-bold">Média por Contrato</span>
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1E293B] shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
                  <TrendingUp className="w-5 h-5" />
               </div>
            </div>
            <div>
               <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  <span className="text-xl align-top mr-1 font-bold text-[#CBD5E1]/50">R$</span>
                  {Math.round(avgTicket).toLocaleString('pt-BR')}
               </h2>
               <p className="text-[11px] text-[#CBD5E1]/70 font-bold mt-2">Ticket médio da praça</p>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-[#FF6B1A]/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest font-bold">Índice Amortização</span>
               <div className="w-10 h-10 bg-[#FF6B1A]/10 rounded-xl flex items-center justify-center text-[#FF6B1A] border border-[#FF6B1A]/20">
                  <Layers className="w-5 h-5" />
               </div>
            </div>
            <div>
               <h2 className="text-4xl font-extrabold text-white">{indexAmortization}</h2>
               <p className="text-[11px] text-[#CBD5E1]/70 font-bold mt-2">{sacCount} SAC vs {priceCount} Price</p>
            </div>
          </div>

        </div>

        {/* Data Table Section */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden shadow-md flex flex-col">
          
          <div className="p-6 border-b border-[#334155] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0F172A]">
            <div className="flex-1 w-full relative">
              <Search className="w-5 h-5 text-[#CBD5E1]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Pesquisar por cliente, CPF..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-[#FF6B1A] focus:ring-1 focus:ring-[#FF6B1A]/50 placeholder:text-[#CBD5E1]/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {['Todos', 'Pendente', 'Em Análise', 'Aprovado', 'Recusado'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-[#FF6B1A] text-white shadow-sm' : 'bg-[#1E293B] text-[#CBD5E1] border border-[#334155] hover:bg-white/5 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <div className="p-16 text-center text-white/40 text-sm flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                Nenhuma ficha cadastral encontrada.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-white">
                <thead>
                  <tr className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest font-bold border-b border-[#334155] bg-[#0F172A]">
                    <th className="px-6 py-4 whitespace-nowrap">ID / Envio</th>
                    <th className="px-6 py-4 whitespace-nowrap">Titular Principal</th>
                    <th className="px-6 py-4 whitespace-nowrap">Coonjuge (P2)?</th>
                    <th className="px-6 py-4 whitespace-nowrap">Imóvel Valor</th>
                    <th className="px-6 py-4 whitespace-nowrap">Financiado</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredSubmissions.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-white/5 cursor-pointer bg-transparent transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-bold text-white text-[13px]">#{sub.id}</div>
                        <div className="text-[11px] text-[#CBD5E1]/50 mt-1 font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-bold text-white text-[14px]">{(sub.p1 as any).fullName}</div>
                        <div className="text-[12px] text-[#CBD5E1]/70 font-mono mt-1">{(sub.p1 as any).cpf}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[#0F172A]">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.hasP2 ? 'bg-white text-[#0F172A]' : 'bg-[#0F172A] text-[#CBD5E1]/70 border border-[#334155]'}`}>
                          {sub.hasP2 ? 'Sim (Cônjuge)' : 'Não'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap font-bold text-white text-[14px]">
                        R$ {Number(sub.saleValue).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="font-bold text-[#FF6B1A] text-[14px]">R$ {Number(sub.financingValue).toLocaleString('pt-BR')}</div>
                        <div className="text-[11px] text-[#CBD5E1]/70 uppercase tracking-widest mt-1 font-bold">{sub.termYears} anos • {sub.amortizationSystem}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] px-3 py-1.5 rounded-lg w-max shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#FF6B1A] shadow-[0_0_8px_rgba(255,107,26,0.5)]"></span>
                            <span className="text-[11px] font-bold text-[#CBD5E1]">Em Análise</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                           <button className="flex items-center gap-1.5 px-3 py-2 border border-[#334155] text-[#CBD5E1] hover:bg-[#334155] hover:text-white rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all shadow-sm">
                              Detalhes
                           </button>
                           <button
                             onClick={(e) => { e.stopPropagation(); handleDownload(sub); }}
                             className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B1A] text-white rounded-lg text-[10px] uppercase font-bold tracking-widest hover:bg-[#E85D04] transition-all shadow-sm"
                           >
                             <Download className="w-3.5 h-3.5" />
                             PDF
                           </button>
                           <button
                             onClick={(e) => { e.stopPropagation(); clearData() }}
                             className="w-8 h-8 flex items-center justify-center border border-[#334155] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 rounded-lg text-[#CBD5E1]/50 transition-all shadow-sm"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
