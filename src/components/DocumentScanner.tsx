import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentScannerProps {
  onDataExtracted: (data: string) => void;
}

export function DocumentScanner({ onDataExtracted }: DocumentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setResultMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'por');
    formData.append('isOverlayRequired', 'false');
    formData.append('isTable', 'true');
    formData.append('apikey', import.meta.env.VITE_OCR_API_KEY || 'helloworld');

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage?.[0] || 'Falha na leitura do documento');
      }

      const parsedText = data?.ParsedResults?.[0]?.ParsedText || "";

      if (parsedText && parsedText.trim().length > 0) {
        onDataExtracted(parsedText);
        setResultMessage({ type: 'success', text: 'Documento lido com sucesso!' });
      } else {
        setResultMessage({ type: 'success', text: 'Não foi possível identificar textos legíveis. Tente uma imagem com melhor qualidade.' });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Erro de conexão com o OCR' });
    } finally {
      setIsScanning(false);
      // Reset input so same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-8 border-2 border-dashed border-[#334155] bg-[#0F172A] rounded-2xl p-6 transition-all hover:border-[#FF6B1A]/50">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0 shadow-sm relative">
           {isScanning ? (
              <Loader2 className="w-8 h-8 text-[#FF6B1A] animate-spin" />
           ) : (
              <FileText className="w-8 h-8 text-[#FF6B1A]" />
           )}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-[15px] font-bold text-white">Leitura Inteligente de Documentos (OCR)</h3>
          <p className="text-[13px] text-[#CBD5E1] mt-1.5 leading-relaxed">
            Faça upload do seu RG, CNH, ou documento de identificação. O sistema tentará extrair os dados automaticamente (disponível via OCR.space).
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex flex-col items-center">
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-[13px] rounded-xl transition-all shadow-sm ${
              isScanning 
                ? 'bg-[#1E293B] text-[#CBD5E1]/50 cursor-not-allowed' 
                : 'bg-[#FF6B1A] text-white hover:bg-[#E85D04] shadow-[0_4px_12px_rgba(255,107,26,0.25)]'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            {isScanning ? 'Analisando...' : 'Anexar Documento'}
          </button>
        </div>
      </div>

      {resultMessage && (
        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
          resultMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {resultMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          <div>
             <p className="text-[13px] font-bold">{resultMessage.text}</p>
             {resultMessage.type === 'success' && (
               <p className="text-[11px] opacity-80 mt-1">Os campos que o modelo conseguiu identificar foram automaticamente preenchidos abaixo.</p>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
