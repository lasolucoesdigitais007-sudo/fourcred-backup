import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormData } from '../types';
import { Input, Select, Textarea, SimNaoButtons } from '../components/FormFields';
import { DocumentScanner } from '../components/DocumentScanner';

export default function ClientForm() {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const hasP2 = watch('hasP2');
  const usedFgts = watch('usedFgts');
  const ownsProperty = watch('ownsProperty');
  const useFgts = watch('useFgts');
  const p1ZipCode = watch('p1.zipCode');
  const p2ZipCode = watch('p2.zipCode');

  useEffect(() => {
    if (p1ZipCode) {
      const cleanZip = p1ZipCode.replace(/\D/g, '');
      if (cleanZip.length === 8) {
        fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) {
              setValue('p1.street', data.logradouro, { shouldValidate: true });
              setValue('p1.neighborhood', data.bairro, { shouldValidate: true });
              setValue('p1.city', data.localidade, { shouldValidate: true });
              setValue('p1.state', data.uf, { shouldValidate: true });
            }
          })
          .catch(err => console.error("CEP Fetch error", err));
      }
    }
  }, [p1ZipCode, setValue]);

  useEffect(() => {
    if (p2ZipCode) {
      const cleanZip = p2ZipCode.replace(/\D/g, '');
      if (cleanZip.length === 8) {
        fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) {
              setValue('p2.street', data.logradouro, { shouldValidate: true });
              setValue('p2.neighborhood', data.bairro, { shouldValidate: true });
              setValue('p2.city', data.localidade, { shouldValidate: true });
              setValue('p2.state', data.uf, { shouldValidate: true });
            }
          })
          .catch(err => console.error("CEP Fetch error", err));
      }
    }
  }, [p2ZipCode, setValue]);

  const handleOcrData = (text: string) => {
    const cleanedText = text.replace(/\n/g, ' ');
    
    // Extrahir CPF (000.000.000-00 ou 00000000000)
    const cpfMatch = cleanedText.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
    if (cpfMatch) {
      setValue('p1.cpf', cpfMatch[0].replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"), { shouldValidate: true });
    }

    // Extrahir RG (ex: 12.345.678-9) - Heuristica simples
    const rgMatch = cleanedText.match(/\d{2}\.?\d{3}\.?\d{3}-?[A-Za-z0-9]{1,2}/);
    if (rgMatch && !cpfMatch?.[0].includes(rgMatch[0])) {
      setValue('p1.rg', rgMatch[0], { shouldValidate: true });
    }

    // Extrahir Data de Nascimento (xx/xx/xxxx)
    const dateMatch = cleanedText.match(/\b([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}\b/);
    if (dateMatch) {
      const [day, month, year] = dateMatch[0].split('/');
      setValue('p1.dob', `${year}-${month}-${day}`, { shouldValidate: true });
    }

    console.log("Extracted OCR Text: ", cleanedText);
  };

  const nextStep = async () => {
    let isStepValid = true;
    if (currentStep === 1) {
      isStepValid = await trigger('p1' as any);
    } else if (currentStep === 2) {
       isStepValid = await trigger('p1' as any);
    } else if (currentStep === 3) {
      isStepValid = hasP2 ? await trigger(['p2Relationship', 'p2'] as any) : true;
    } else if (currentStep === 4) {
      isStepValid = await trigger(['usedFgts', 'fgtsSubsidy', 'ownsProperty', 'propertyAddress', 'propertyFraction', 'otherAssets'] as any);
    }

    if (isStepValid) {
      let next = currentStep + 1;
      if (next === 3 && !hasP2) next = 4;
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    let prev = currentStep - 1;
    if (prev === 3 && !hasP2) prev = 2;
    setCurrentStep(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fillMockData = () => {
    // P1
    setValue('p1.fullName', 'Ricardo Mendes Santos');
    setValue('p1.cpf', '123.456.789-00');
    setValue('p1.rg', '12.345.678-x SSP/SP');
    setValue('p1.gender', 'M');
    setValue('p1.nationality', 'Brasileira');
    setValue('p1.placeOfBirth', 'São Paulo - SP');
    setValue('p1.dob', '1985-05-15');
    setValue('p1.motherName', 'Maria Mendes Santos');
    setValue('p1.maritalStatus', 'casado');
    setValue('p1.childrenCount', 2 as any);
    setValue('p1.educationLevel', 'superior_comp');
    setValue('p1.email', 'ricardo.mendes@email.com');
    setValue('p1.phoneMobile', '(11) 98765-4321');
    setValue('p1.street', 'Rua das Flores');
    setValue('p1.number', '123');
    setValue('p1.complement', 'Apto 45');
    setValue('p1.neighborhood', 'Bela Vista');
    setValue('p1.city', 'São Paulo');
    setValue('p1.state', 'SP');
    setValue('p1.zipCode', '01311-000');
    setValue('p1.residenceType', 'alugada');
    setValue('p1.residenceTime', 5 as any);
    setValue('p1.hasFinancing', 'nao');
    setValue('p1.hasLoan', 'nao');
    
    // P1 Work
    setValue('p1.profession', 'Engenheiro Civil');
    setValue('p1.company', 'Construtora XYZ');
    setValue('p1.isOwner', 'nao');
    setValue('p1.currentRole', 'Engenheiro Sênior');
    setValue('p1.serviceTime', 48 as any);
    setValue('p1.salary', 12500.00 as any);
    setValue('p1.admissionDate', '2020-01-10');
    setValue('p1.otherIncomes', 1200 as any);
    setValue('p1.otherIncomesOrigin', 'Aluguéis');

    // P2
    setValue('hasP2', true);
    setValue('p2Relationship', 'Cônjuge');
    setValue('p2.fullName', 'Ana Paula Oliveira Mendes');
    setValue('p2.cpf', '098.765.432-11');
    setValue('p2.rg', '23.456.789-y SSP/SP');
    setValue('p2.gender', 'F');
    setValue('p2.nationality', 'Brasileira');
    setValue('p2.placeOfBirth', 'Campinas - SP');
    setValue('p2.dob', '1988-08-22');
    setValue('p2.motherName', 'Josefina Oliveira');
    setValue('p2.maritalStatus', 'casado');
    setValue('p2.childrenCount', 2 as any);
    setValue('p2.educationLevel', 'superior_comp');
    setValue('p2.email', 'ana.paula@email.com');
    setValue('p2.phoneMobile', '(11) 91234-5678');
    setValue('p2.street', 'Rua das Flores');
    setValue('p2.number', '123');
    setValue('p2.complement', 'Apto 45');
    setValue('p2.neighborhood', 'Bela Vista');
    setValue('p2.city', 'São Paulo');
    setValue('p2.state', 'SP');
    setValue('p2.zipCode', '01311-000');
    setValue('p2.profession', 'Arquiteta');
    setValue('p2.company', 'Estúdio Novo');
    setValue('p2.currentRole', 'Sócia Diretora');
    setValue('p2.serviceTime', 36 as any);
    setValue('p2.salary', 8000.00 as any);

    // Credit Analysis
    setValue('usedFgts', 'sim');
    setValue('fgtsSubsidy', 'nao');
    setValue('ownsProperty', 'nao');
    setValue('otherAssets', 'Poupança ativa de R$ 95.000');
    setValue('targetPropertyAddress', 'Av. Paulista, 1200 - Apto 142, Jardim Paulista, SP');
    setValue('parkingSpaces', 2 as any);

    // Operation Values
    setValue('saleValue', 890000.00 as any);
    setValue('downPayment', 390000.00 as any);
    setValue('useFgts', 'sim');
    setValue('fgtsValue', 45000.00 as any);
    setValue('financingValue', 500000.00 as any);
    setValue('termYears', 35 as any);
    setValue('amortizationSystem', 'sac');

    // Terms
    setValue('acceptedTerms', true);
  };

  const handleCopyAddress = () => {
    setValue('p2.street', watch('p1.street'));
    setValue('p2.number', watch('p1.number'));
    setValue('p2.complement', watch('p1.complement'));
    setValue('p2.neighborhood', watch('p1.neighborhood'));
    setValue('p2.city', watch('p1.city'));
    setValue('p2.state', watch('p1.state'));
    setValue('p2.zipCode', watch('p1.zipCode'));
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    const fullData = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Erro ao enviar a submissão.');
      }

      const result = await response.json();
      alert(`Ficha cadastral enviada com sucesso! ID: ${result.id}`);
      window.location.reload();
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Falha ao enviar a ficha: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'Dados Pessoais (P1)', subtitle: 'Identidade e contato' },
    { num: 2, title: 'Renda & Trabalho (P1)', subtitle: 'Profissional' },
    { num: 3, title: 'Co-Proponente (P2)', subtitle: 'Cônjuge ou parceiro' },
    { num: 4, title: 'Análise de Crédito', subtitle: 'FGTS e Bens' },
    { num: 5, title: 'Imóvel & Operação', subtitle: 'Financiamento' }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-[#0F172A] text-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-0">
        
        {/* Navigation Steps Header */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-t-xl px-6 sm:px-10 flex items-center justify-between overflow-x-auto hide-scrollbar gap-6 h-20 shadow-md relative z-10 w-full mb-[-1px]">
          {stepsHeader.map((step, idx) => {
            const isActive = currentStep === step.num;
            const isPast = currentStep > step.num;
            const isFutureDisabled = currentStep < step.num;

            return (
              <div key={step.num} className={`flex items-center gap-3 min-w-max py-4 h-full relative transition-all ${isActive ? 'opacity-100' : 'opacity-50'} ${step.num === 3 && !hasP2 ? 'opacity-20' : ''}`}>
                <div className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 transition-colors shadow-sm ${isActive ? 'bg-[#FF6B1A] text-white shadow-[#FF6B1A]/30' : isPast ? 'bg-[#1E293B] border border-[#FF6B1A] text-[#FF6B1A]' : 'bg-[#0F172A] border border-[#334155] text-[#CBD5E1]/50'}`}>
                  {isPast ? '✓' : step.num}
                </div>
                <div className="flex flex-col justify-center">
                  <div className={`text-[13px] font-bold ${isActive || isPast ? 'text-white' : 'text-[#CBD5E1]/70'}`}>{step.title}</div>
                  <div className="text-[#CBD5E1]/50 text-[11px] font-medium leading-none mt-1">{step.subtitle}</div>
                </div>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF6B1A] rounded-t-sm shadow-[0_0_12px_rgba(255,107,26,0.5)]" />}
              </div>
            );
          })}
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-b-xl p-6 sm:p-10 shadow-xl relative z-0 min-h-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0" noValidate>
            
            {/* ================= STEP 1 ================= */}
            <div className={currentStep === 1 ? 'block space-y-12 animate-in fade-in slide-in-from-right-4' : 'hidden'}>
              <div>
                <div className="mb-6 border-b border-[#334155] pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Identificação do Primeiro Proponente</h2>
                    <button type="button" onClick={fillMockData} className="text-[#FF6B1A] text-xs font-bold hover:text-[#E85D04] transition-colors flex items-center gap-1">✨ Preencher Rápido</button>
                  </div>
                  <p className="text-[13px] text-[#CBD5E1]">Insira abaixo os dados básicos de identidade do proponente titular da operação.</p>
                </div>
                
                <DocumentScanner onDataExtracted={handleOcrData} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <Input label="Nome Completo *" name="p1.fullName" register={register} errors={errors} placeholder="Nome sem abreviações" required />
                  <Input label="CPF *" name="p1.cpf" register={register} errors={errors} placeholder="000.000.000-00" required />
                  <Input label="RG *" name="p1.rg" register={register} errors={errors} placeholder="Nº e Órgão Emissor" required />
                  <Select label="Sexo *" name="p1.gender" register={register} errors={errors} options={[{ label: 'Masculino', value: 'M' }, { label: 'Feminino', value: 'F' }]} required />
                  <Input label="Data de Nascimento *" name="p1.dob" type="date" register={register} errors={errors} required />
                  <Input label="Nacionalidade *" name="p1.nationality" register={register} errors={errors} required />
                  <Input label="Naturalidade / Cidade Natal *" name="p1.placeOfBirth" register={register} errors={errors} required />
                  <Select label="Estado Civil *" name="p1.maritalStatus" register={register} errors={errors} options={[
                    { label: 'Solteiro(a)', value: 'solteiro' }, { label: 'Casado(a)', value: 'casado' }, 
                    { label: 'União Estável', value: 'uniao_estavel' }, { label: 'Divorciado(a)', value: 'divorciado' }, { label: 'Viúvo(a)', value: 'viuvo' }
                  ]} required />
                  <Input label="Nome Completo da Mãe *" name="p1.motherName" register={register} errors={errors} required />
                  <Input label="Nº de Filhos *" name="p1.childrenCount" type="number" register={register} errors={errors} required />
                  <Select label="Grau Escolaridade *" name="p1.educationLevel" register={register} errors={errors} options={[
                    { label: 'Médio Completo', value: 'medio' }, { label: 'Superior Incompleto', value: 'superior_inc' }, { label: 'Superior Completo', value: 'superior_comp' },
                  ]} required />
                  <Input label="Email Principal *" name="p1.email" type="email" register={register} errors={errors} required />
                  <Input label="Email Secundário" name="p1.secondaryEmail" type="email" register={register} errors={errors} />
                  <Input label="Telefone Celular *" name="p1.phoneMobile" register={register} errors={errors} required />
                  <Input label="Telefone Residencial" name="p1.phoneHome" register={register} errors={errors} />
                  <Input label="Telefone de Recado" name="p1.phoneMessage" register={register} errors={errors} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#334155] pb-2 mb-6">Endereço Residencial Atual (P1)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <Input label="CEP *" name="p1.zipCode" register={register} errors={errors} required placeholder="Ex: 00000-000" />
                  <Input label="Rua / Logradouro *" className="md:col-span-3" name="p1.street" register={register} errors={errors} required />
                  <Input label="Número *" name="p1.number" register={register} errors={errors} required />
                  <Input label="Complemento" className="md:col-span-3" name="p1.complement" register={register} errors={errors} />
                  
                  <Input label="Bairro *" className="md:col-span-2" name="p1.neighborhood" register={register} errors={errors} required />
                  <Input label="Cidade *" name="p1.city" register={register} errors={errors} required />
                  <Input label="Estado (UF) *" name="p1.state" register={register} errors={errors} required />
                  
                  <Select label="Tipo Residência *" name="p1.residenceType" register={register} errors={errors} className="md:col-span-2" options={[
                    { label: 'Própria', value: 'propria' }, { label: 'Alugada', value: 'alugada' }, { label: 'Com os pais', value: 'pais' }
                  ]} required />
                  <Input label="Tempo (anos) *" name="p1.residenceTime" type="number" register={register} errors={errors} required />
                </div>
              </div>
            </div>

            {/* ================= STEP 2 ================= */}
            <div className={currentStep === 2 ? 'block space-y-12 animate-in fade-in slide-in-from-right-4' : 'hidden'}>
               <div>
                <div className="mb-6 border-b border-[#334155] pb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Perfil de Renda e Atividade Profissional (P1)</h2>
                  <p className="text-[13px] text-slate-400 mt-2">Insira suas informações sobre atividade econômica atual para balizamento de renda.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <Input label="Profissão Atual *" name="p1.profession" register={register} errors={errors} required />
                  <Input label="Nome da Empresa / Órgão Público *" name="p1.company" register={register} errors={errors} required />
                  <Input label="Cargo Atual *" name="p1.currentRole" register={register} errors={errors} required />
                  
                  <div className="flex items-center mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input type="checkbox" {...register('p1.isOwner')} value="sim" className="w-5 h-5 text-[#FF6B1A] bg-[#0F172A] border-[#334155] rounded-md focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors" />
                      <span className="text-sm font-semibold text-[#CBD5E1] group-hover:text-white transition-colors">Sou proprietário / sócio desta empresa</span>
                    </label>
                  </div>

                  <Input label="Tempo de Serviço *" name="p1.serviceTime" placeholder="Ex: 3 anos e meio" register={register} errors={errors} required />
                  <Input label="Renda Salarial Mensal Líquida (R$) *" name="p1.salary" type="number" step="0.01" register={register} errors={errors} required />
                  <Input label="Data de Admissão *" name="p1.admissionDate" type="date" register={register} errors={errors} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Outras Rendas Mensais (Valor R$)" name="p1.otherIncomes" type="number" step="0.01" register={register} errors={errors} />
                  <Input label="Origem / Comprovação de Outras Rendas" name="p1.otherIncomesOrigin" register={register} errors={errors} />
                </div>
                
                <div className="mt-12 border border-[#334155] bg-[#0F172A] p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-4">
                     <div className="mt-1 text-[#FF6B1A] text-xl">👥</div>
                     <div>
                        <h3 className="text-[15px] font-bold text-white tracking-wide">Adicionar Cônjuge ou Segundo Proponente?</h3>
                        <p className="text-[13px] text-[#CBD5E1] mt-1">Somar rendas de dois proponentes aumenta significativamente a margem de aprovação.</p>
                     </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" {...register('hasP2')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-[#1E293B] border border-[#334155] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0F172A] after:border-gray-500 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#FF6B1A]"></div>
                    <span className="ml-3 text-[13px] font-bold text-[#CBD5E1] uppercase tracking-wider w-8">{hasP2 ? 'SIM' : 'NÃO'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ================= STEP 3 ================= */}
            <div className={currentStep === 3 ? 'block space-y-12 animate-in fade-in slide-in-from-right-4' : 'hidden'}>
              <div className="border border-[#334155] bg-[#0F172A] shadow-sm rounded-xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <span className="text-[#FF6B1A]">👥</span> Segundo Proponente Coparticipante
                  </h3>
                  <p className="text-[13px] text-[#CBD5E1] mt-1">Insira as informações do parceiro que agregará recursos ao pleito.</p>
                </div>
                <button type="button" onClick={handleCopyAddress} className="px-5 py-2.5 bg-[#1E293B] border border-[#334155] text-white text-[13px] font-bold rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm">
                  📍 Copiar Endereço do Proponente 1
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                 <Select label="Relacionamento com Proponente 1 *" name="p2Relationship" register={register} errors={errors} options={[
                    { label: 'Cônjuge', value: 'Cônjuge' }, { label: 'União Estável', value: 'União Estável' }, { label: 'Outro', value: 'Outro' }
                  ]} />
                 <Input label="Nome Completo do Segundo Proponente *" name="p2.fullName" register={register} errors={errors} />
                 <Input label="CPF *" name="p2.cpf" register={register} errors={errors} />
                 <Input label="RG *" name="p2.rg" register={register} errors={errors} />
                 <Input label="Data de Nascimento *" name="p2.dob" type="date" register={register} errors={errors} />
                 <Select label="Sexo *" name="p2.gender" register={register} errors={errors} options={[{ label: 'Masculino', value: 'M' }, { label: 'Feminino', value: 'F' }]} />
                 <Input label="Nacionalidade *" name="p2.nationality" register={register} errors={errors} />
                 <Input label="Naturalidade / Cidade Natal *" name="p2.placeOfBirth" register={register} errors={errors} />
                 <Select label="Estado Civil *" name="p2.maritalStatus" register={register} errors={errors} options={[
                    { label: 'Solteiro(a)', value: 'solteiro' }, { label: 'Casado(a)', value: 'casado' }, 
                    { label: 'União Estável', value: 'uniao_estavel' }, { label: 'Divorciado(a)', value: 'divorciado' }, { label: 'Viúvo(a)', value: 'viuvo' }
                  ]} />
                 <Input label="Nome Completo da Mãe *" name="p2.motherName" register={register} errors={errors} />
                 <Input label="Email Principal *" name="p2.email" type="email" register={register} errors={errors} />
                 <Input label="Telefone Celular *" name="p2.phoneMobile" register={register} errors={errors} />
                 <Select label="Grau Escolaridade *" name="p2.educationLevel" register={register} errors={errors} options={[
                    { label: 'Médio Completo', value: 'medio' }, { label: 'Superior Incompleto', value: 'superior_inc' }, { label: 'Superior Completo', value: 'superior_comp' },
                  ]} />
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#334155] pb-2 mb-6">Endereço Residencial do Proponente 2:</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                  <Input label="CEP *" name="p2.zipCode" register={register} errors={errors} placeholder="Ex: 00000-000" />
                  <Input label="Rua / Logradouro *" className="md:col-span-3" name="p2.street" register={register} errors={errors} />
                  <Input label="Número *" name="p2.number" register={register} errors={errors} />
                  <Input label="Complemento" name="p2.complement" className="md:col-span-3" register={register} errors={errors} />
                  <Input label="Bairro *" className="md:col-span-2" name="p2.neighborhood" register={register} errors={errors} />
                  <Input label="Cidade *" name="p2.city" register={register} errors={errors} />
                  
                  <Input label="Estado (UF) *" name="p2.state" register={register} errors={errors} />
                  
                  <Input label="Renda Salarial Titular 2 *" name="p2.salary" type="number" step="0.01" register={register} errors={errors} className="md:col-span-3" />
                  
                  <Input label="Profissão do Titular 2 *" name="p2.profession" className="md:col-span-4" register={register} errors={errors} />
                  <Input label="Empresa Trabalha *" name="p2.company" className="md:col-span-2" register={register} errors={errors} />
                  <Input label="Tempo de Serviço *" name="p2.serviceTime" className="md:col-span-2" register={register} errors={errors} />
                </div>
              </div>
            </div>

             {/* ================= STEP 4 ================= */}
            <div className={currentStep === 4 ? 'block space-y-12 animate-in fade-in slide-in-from-right-4' : 'hidden'}>
               <div>
                 <div className="mb-6 border-b border-[#334155] pb-4">
                   <h2 className="text-lg font-bold text-white tracking-tight">Histórico de FGTS e outros Bens</h2>
                   <p className="text-[13px] text-slate-400 mt-1">Dados relativos à sua situação patrimonial e elegibilidade de subsídios habitacionais.</p>
                 </div>
                 
                 <div className="bg-[#0F172A] border border-[#334155] rounded-xl px-6 py-2 mb-8 shadow-sm">
                    <SimNaoButtons 
                      label="Já utilizou recursos do FGTS para aquisição de imóvel?" 
                      sublabel="Em qualquer localidade do território nacional" 
                      name="usedFgts" register={register} watch={watch} setValue={setValue} 
                    />
                    <SimNaoButtons 
                      label="Já foi beneficiado com algum subsídio oriundo do FGTS?" 
                      sublabel="Ex: Desconto em juros na taxa do Programa Minha Casa Minha Vida" 
                      name="fgtsSubsidy" register={register} watch={watch} setValue={setValue} 
                    />
                    <SimNaoButtons 
                      label="É proprietário de outro imóvel ou possui fração ideal?" 
                      sublabel="Terrenos, salas, apartamentos comerciais ou residenciais" 
                      name="ownsProperty" register={register} watch={watch} setValue={setValue} 
                    />
                 </div>

                 <div className="space-y-4">
                    <Textarea label="Outros Bens e Aplicações Patrimoniais" name="otherAssets" register={register} errors={errors} rows={4} />
                 </div>
               </div>
            </div>

            {/* ================= STEP 5 ================= */}
            <div className={currentStep === 5 ? 'block space-y-12 animate-in fade-in slide-in-from-right-4' : 'hidden'}>
              <div>
                <div className="mb-6 border-b border-[#334155] pb-4">
                   <h2 className="text-lg font-bold text-white tracking-tight">Dados do Imóvel Pretendido e Operação Financeira</h2>
                   <p className="text-[13px] text-slate-400 mt-1">Configuração monetária exata da sua proposta de aquisição, prazos e modalidade de cálculo amortizável.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                   <Input label="Endereço Completo do Imóvel Pretendido *" name="targetPropertyAddress" className="md:col-span-2" register={register} errors={errors} required />
                   <Input label="Nº Vagas de Garagem no Imóvel *" name="parkingSpaces" type="number" register={register} errors={errors} required />
                   
                   <Input label="Valor Total de Venda / Avaliação (R$) *" name="saleValue" type="number" step="0.01" register={register} errors={errors} required />
                   <Input label="Entrada (Recursos Próprios) (R$) *" name="downPayment" type="number" step="0.01" register={register} errors={errors} required />
                   <Select label="Sistema de Amortização *" name="amortizationSystem" register={register} errors={errors} options={[{label:'SAC (Prestações Decrescentes)', value:'sac'}, {label:'Price (Prestações Fixas)', value:'price'}]} required />
                 </div>

                 <div className="border border-[#334155] bg-[#0F172A] p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shadow-sm">
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input type="checkbox" {...register('useFgts')} value="sim" className="w-5 h-5 text-[#FF6B1A] bg-[#1E293B] border-[#334155] rounded-md focus:ring-[#FF6B1A]/20 transition-colors" />
                      </div>
                      <div>
                         <h3 className="text-[15px] font-bold text-white tracking-wide">Deseja abater ou utilizar saldo de FGTS na operação?</h3>
                         <p className="text-[13px] text-[#CBD5E1] mt-1">Você pode resgatar saldos de contas ativas e inativas.</p>
                      </div>
                   </div>
                   <div className="w-full md:w-64">
                     <Input label="VALOR DO FGTS A UTILIZAR (R$):" name="fgtsValue" type="number" step="0.01" register={register} errors={errors} className="uppercase" />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <Input label="Valor da Parcela Financiada (R$) * (Aprox.)" name="financingValue" type="number" step="0.01" register={register} errors={errors} required />
                    <Input label="Prazo Financiamento (Anos) *" name="termYears" type="number" register={register} errors={errors} required />
                 </div>

                 <div className="border border-[#334155] bg-[#0F172A] p-6 rounded-xl flex items-start gap-4 mb-8 shadow-sm">
                    <span className="text-[#CBD5E1] mt-0.5 border border-[#334155] rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-sm font-bold bg-[#1E293B]">i</span>
                    <p className="text-[13px] text-[#CBD5E1] font-medium leading-relaxed">* Lembre-se que o limite máximo de financiamento imobiliário no Brasil costuma ser de <strong className="text-white">80% do valor avaliado</strong> do imóvel.</p>
                 </div>

                 <div className="bg-[#0F172A] border border-[#FF6B1A]/50 rounded-xl p-6 text-white text-sm shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF6B1A]"></div>
                   <h3 className="font-bold text-lg mb-4 ml-2">DECLARAÇÕES E TERMOS DO CANDIDATO</h3>
                   <div className="flex items-start gap-4 ml-2">
                     <input
                        id="acceptedTerms"
                        type="checkbox"
                        {...register('acceptedTerms', { required: 'Você deve aceitar os termos para prosseguir' })}
                        className="w-5 h-5 mt-0.5 text-[#FF6B1A] rounded-md bg-[#1E293B] border-[#334155] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors cursor-pointer"
                      />
                      <div>
                        <label htmlFor="acceptedTerms" className="font-bold text-[14px] cursor-pointer block">Declaro que as informações acima prestadas são verdadeiras e exatas.</label>
                        <p className="text-[#CBD5E1] mt-1.5 text-[13px] leading-relaxed">Autorizo a Fourcred Soluções Imobiliárias a utilizar estes dados para fins de simulação e pré-aprovação de crédito junto a instituições financeiras, incluindo consultas a órgãos de proteção ao crédito (SPC, Serasa) e o envio de propostas.</p>
                        {errors.acceptedTerms && <p className="text-red-400 mt-2 text-xs font-bold">{(errors.acceptedTerms as any).message}</p>}
                      </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Navigation Buttons footer */}
            <hr className="border-[#334155] my-8" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={prevStep}
                className={`px-8 py-3.5 bg-[#0F172A] border border-[#334155] text-[#CBD5E1] font-bold rounded-xl text-[14px] hover:bg-[#334155] hover:text-white transition-all shadow-sm focus:outline-none w-full sm:w-auto flex items-center justify-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                &lt; Anterior
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-10 py-3.5 bg-[#FF6B1A] text-white font-bold rounded-xl text-[14px] shadow-[0_4px_14px_rgba(255,107,26,0.3)] hover:bg-[#E85D04] transition-all focus:outline-none flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Próximo Passo &gt;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-10 py-3.5 bg-[#FF6B1A] text-white font-bold rounded-xl text-[14px] shadow-[0_4px_14px_rgba(255,107,26,0.3)] hover:bg-[#E85D04] transition-all focus:outline-none flex items-center justify-center gap-2 w-full sm:w-auto ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Enviando...' : 'Enviar Proposta de Financiamento ✓'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
