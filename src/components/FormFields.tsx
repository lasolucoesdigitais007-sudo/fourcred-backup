import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  className?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, name, register, errors, type = 'text', className = '', icon, rightElement, ...rest }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label className="text-[12px] font-bold text-[#CBD5E1] tracking-wide">{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="absolute left-3.5 flex items-center text-[#CBD5E1]/50">{icon}</div>}
      <input
        type={type}
        {...register(name)}
        className={`w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[14px] font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 focus:border-[#FF6B1A] transition-all placeholder:text-[#64748B] ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-[140px]' : ''}`}
        {...rest}
      />
      {rightElement && <div className="absolute right-0 top-0 bottom-0 flex items-center">{rightElement}</div>}
    </div>
    {errors[name] && <span className="text-[11px] font-semibold text-red-400 mt-1">{(errors[name] as any)?.message || 'Campo inválido'}</span>}
  </div>
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, name, register, errors, className = '', rows = 3, ...rest }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label className="text-[12px] font-bold text-[#CBD5E1] tracking-wide">{label}</label>
    <textarea
      {...register(name)}
      rows={rows}
      className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[14px] font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 focus:border-[#FF6B1A] transition-all placeholder:text-[#64748B] resize-none"
      {...rest}
    ></textarea>
    {errors[name] && <span className="text-[11px] font-semibold text-red-400 mt-1">{(errors[name] as any)?.message || 'Campo inválido'}</span>}
  </div>
);

export const SimNaoButtons: React.FC<{ label: string; sublabel?: string; name: string; register: UseFormRegister<any>; watch: UseFormWatch<any>; setValue: UseFormSetValue<any> }> = ({ label, sublabel, name, register, watch, setValue }) => {
  const value = watch(name);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-[#334155] last:border-0 gap-4 group">
      <div className="flex-1 pr-4">
        <h3 className="text-[14px] font-bold text-white tracking-wide">{label}</h3>
        {sublabel && <p className="text-[13px] text-[#CBD5E1]/70 mt-1.5">{sublabel}</p>}
      </div>
      <div className="flex bg-[#0F172A] border border-[#334155] rounded-xl p-1.5 shrink-0 w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setValue(name, 'sim', { shouldValidate: true })}
          className={`px-8 py-2 text-[13px] font-bold rounded-lg transition-all ${value === 'sim' ? 'bg-[#FF6B1A] text-white shadow-md' : 'text-[#CBD5E1]/70 hover:text-white hover:bg-white/5'}`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => setValue(name, 'nao', { shouldValidate: true })}
          className={`px-8 py-2 text-[13px] font-bold rounded-lg transition-all ${value === 'nao' || !value ? 'bg-[#FF6B1A] text-white shadow-md' : 'text-[#CBD5E1]/70 hover:text-white hover:bg-white/5'}`}
        >
          Não
        </button>
      </div>
      <input type="hidden" {...register(name, { required: 'Selecione uma opção' })} />
    </div>
  );
};

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  label: string;
  name: string;
  options: { label: string; value: string | number }[];
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const Select: React.FC<SelectProps> = ({ label, name, options, register, errors, className = '', ...rest }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label className="text-[12px] font-bold text-[#CBD5E1] tracking-wide">{label}</label>
    <select
      {...register(name)}
      className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[14px] font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 focus:border-[#FF6B1A] transition-all appearance-none"
      {...rest}
    >
      <option value="">Selecione...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {errors[name] && <span className="text-[11px] font-semibold text-red-400 mt-1">{(errors[name] as any)?.message || 'Campo inválido'}</span>}
  </div>
);
