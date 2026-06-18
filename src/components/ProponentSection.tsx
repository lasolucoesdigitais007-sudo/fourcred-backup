import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input, Select } from '../components/FormFields';

interface ProponentSectionProps {
  prefix: 'p1' | 'p2';
  title: string;
  subtitle?: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
}

export const ProponentSection: React.FC<ProponentSectionProps> = ({ prefix, title, subtitle, register, errors, watch }) => {
  const hasFinancing = watch(`${prefix}.hasFinancing`);
  const hasLoan = watch(`${prefix}.hasLoan`);
  
  return (
    <div className="space-y-6">
      <div className="mb-6 border-b border-[#3D342E] pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-[13px] text-blue-200/60 mt-1">{subtitle}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Input label="Nome Completo *" name={`${prefix}.fullName`} register={register} errors={errors} placeholder="Nome sem abreviações" required />
        <Input label="CPF *" name={`${prefix}.cpf`} register={register} errors={errors} placeholder="000.000.000-00" required />
        <Input label="RG *" name={`${prefix}.rg`} register={register} errors={errors} placeholder="Nº e Órgão Emissor" required />
        
        <Select label="Sexo *" name={`${prefix}.gender`} register={register} errors={errors} options={[
          { label: 'Masculino', value: 'M' }, { label: 'Feminino', value: 'F' }, { label: 'Outro', value: 'O' }
        ]} required />
        
        <Input label="Data de Nascimento *" name={`${prefix}.dob`} type="date" register={register} errors={errors} required />
        <Input label="Nacionalidade *" name={`${prefix}.nationality`} register={register} errors={errors} required />
        
        <Input label="Naturalidade / Cidade Natal *" name={`${prefix}.placeOfBirth`} register={register} errors={errors} required />
        
        <Select label="Estado Civil *" name={`${prefix}.maritalStatus`} register={register} errors={errors} options={[
          { label: 'Solteiro(a)', value: 'solteiro' }, { label: 'Casado(a)', value: 'casado' }, 
          { label: 'Divorciado(a)', value: 'divorciado' }, { label: 'Viúvo(a)', value: 'viuvo' }
        ]} required />
        
        <Input label="Nome da Mãe" name={`${prefix}.motherName`} register={register} errors={errors} required />
        <Input label="Nº de Filhos" name={`${prefix}.childrenCount`} type="number" register={register} errors={errors} required />

        <Select label="Grau de Escolaridade" name={`${prefix}.educationLevel`} register={register} errors={errors} options={[
          { label: 'Fundamental', value: 'fundamental' }, { label: 'Médio', value: 'medio' }, 
          { label: 'Superior Incompleto', value: 'superior_inc' }, { label: 'Superior Completo', value: 'superior_comp' },
          { label: 'Pós-graduação', value: 'pos' }
        ]} required />
        
        <Input label="E-mail Principal" name={`${prefix}.email`} type="email" register={register} errors={errors} required />
        <Input label="Celular" name={`${prefix}.phoneMobile`} register={register} errors={errors} required />
        
        <Input label="E-mail Secundário" name={`${prefix}.secondaryEmail`} type="email" register={register} errors={errors} />
        <Input label="Telefone Residencial" name={`${prefix}.phoneHome`} register={register} errors={errors} />
        <Input label="Telefone de Recado" name={`${prefix}.phoneMessage`} register={register} errors={errors} />
      </div>

      <div className="pt-8">
        <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest border-b border-[#3D342E] pb-2 mb-6">Residência Atual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Select label="Tipo" name={`${prefix}.residenceType`} register={register} errors={errors} options={[
            { label: 'Própria', value: 'propria' }, { label: 'Alugada', value: 'alugada' }, 
            { label: 'Financiada', value: 'financiada' }, { label: 'Com os pais', value: 'pais' }
          ]} required />
          <Input label="Tempo (anos)" name={`${prefix}.residenceTime`} type="number" register={register} errors={errors} required />
          <Input label="Endereço Completo" name={`${prefix}.residenceAddress`} register={register} errors={errors} className="lg:col-span-2" required />
        </div>
      </div>

      <div className="pt-8">
        <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest border-b border-[#3D342E] pb-2 mb-6">Obrigações Financeiras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex space-x-4 items-end">
            <Select label="Possui Financiamento?" name={`${prefix}.hasFinancing`} register={register} errors={errors} className="flex-1" options={[
              { label: 'Sim', value: 'sim' }, { label: 'Não', value: 'nao' }
            ]} required />
            {hasFinancing === 'sim' && <Input label="Valor Prestação (R$)" name={`${prefix}.financingInstallment`} type="number" step="0.01" register={register} errors={errors} className="flex-1" />}
          </div>
          
          <div className="flex space-x-4 items-end">
            <Select label="Possui Empréstimo?" name={`${prefix}.hasLoan`} register={register} errors={errors} className="flex-1" options={[
              { label: 'Sim', value: 'sim' }, { label: 'Não', value: 'nao' }
            ]} required />
            {hasLoan === 'sim' && <Input label="Valor Prestação (R$)" name={`${prefix}.loanInstallment`} type="number" step="0.01" register={register} errors={errors} className="flex-1" />}
          </div>
        </div>
      </div>

      <div className="pt-8">
        <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest border-b border-[#3D342E] pb-2 mb-6">Dados Profissionais e Renda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Input label="Profissão" name={`${prefix}.profession`} register={register} errors={errors} required />
          <Input label="Empresa" name={`${prefix}.company`} register={register} errors={errors} required />
          <Select label="É proprietário?" name={`${prefix}.isOwner`} register={register} errors={errors} options={[
            { label: 'Sim', value: 'sim' }, { label: 'Não', value: 'nao' }
          ]} required />
          <Input label="Cargo Atual" name={`${prefix}.currentRole`} register={register} errors={errors} required />
          <Input label="Tempo Serviço (meses)" name={`${prefix}.serviceTime`} type="number" register={register} errors={errors} required />
          <Input label="Salário (R$)" name={`${prefix}.salary`} type="number" step="0.01" register={register} errors={errors} required />
          <Input label="Data Admissão" name={`${prefix}.admissionDate`} type="date" register={register} errors={errors} required />
          
          <Input label="Outras Rendas (R$)" name={`${prefix}.otherIncomes`} type="number" step="0.01" register={register} errors={errors} />
          <Input label="Origem (Outras Rendas)" name={`${prefix}.otherIncomesOrigin`} register={register} errors={errors} className="lg:col-span-3" />
        </div>
      </div>
    </div>
  );
};
