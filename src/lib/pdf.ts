import jsPDF from 'jspdf';
import { FormData } from '../types';

export const generatePDF = (data: FormData) => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 15;
  const pageHeight = doc.internal.pageSize.height;

  const checkPage = (addedHeight: number) => {
    if (yPos + addedHeight >= pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addHeader = (text: string) => {
    checkPage(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // #1e3a8a
    doc.text(text, margin, yPos);
    yPos += 10;
  };

  const addField = (label: string, value: string | number | undefined, inline = false) => {
    if (value === undefined || value === '') return;
    checkPage(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(`${label}:`, margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    const textWidth = doc.getTextWidth(`${label}: `);
    doc.text(`${value}`, margin + textWidth, yPos);
    
    yPos += 8;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22); // #f97316
  doc.text('Ficha Cadastral FOURCRED', margin, yPos);
  yPos += 15;

  addField('ID da Submissão', data.id);
  addField('Data', new Date(data.submittedAt).toLocaleString('pt-BR'));
  yPos += 5;

  // Proponent 1
  addHeader('1. DADOS DO PRIMEIRO PROPONENTE');
  const p1 = data.p1;
  addField('Nome Completo', p1.fullName);
  addField('CPF', p1.cpf);
  addField('RG', p1.rg);
  addField('Sexo', p1.gender);
  addField('Nacionalidade', p1.nationality);
  addField('Naturalidade', p1.placeOfBirth);
  addField('Data de Nascimento', p1.dob);
  addField('Nome da Mãe', p1.motherName);
  addField('Estado Civil', p1.maritalStatus);
  addField('Filhos', p1.childrenCount);
  addField('Escolaridade', p1.educationLevel);
  addField('Email Principal', p1.email);
  addField('Email Secundário', p1.secondaryEmail);
  addField('Telefone Celular', p1.phoneMobile);
  addField('Telefone Residencial', p1.phoneHome);
  addField('Telefone Recado', p1.phoneMessage);

  addHeader('Residência (P1)');
  addField('Tipo', p1.residenceType);
  addField('Tempo (anos)', p1.residenceTime);
  addField('Endereço', p1.residenceAddress);

  addHeader('Obrigações Financeiras (P1)');
  addField('Possui Financiamento', p1.hasFinancing);
  if (p1.hasFinancing === 'sim') addField('Valor Prestação', `R$ ${p1.financingInstallment}`);
  addField('Possui Empréstimo', p1.hasLoan);
  if (p1.hasLoan === 'sim') addField('Valor Prestação', `R$ ${p1.loanInstallment}`);

  addHeader('Dados Profissionais (P1)');
  addField('Profissão', p1.profession);
  addField('Empresa', p1.company);
  addField('É proprietário', p1.isOwner);
  addField('Cargo Atual', p1.currentRole);
  addField('Tempo de Serviço (meses)', p1.serviceTime);
  addField('Salário', `R$ ${p1.salary}`);
  addField('Admissão', p1.admissionDate);
  addField('Outras Rendas', p1.otherIncomes ? `R$ ${p1.otherIncomes}` : 'N/A');
  addField('Origem Outras Rendas', p1.otherIncomesOrigin);

  // Proponent 2
  if (data.hasP2 && data.p2) {
    yPos += 5;
    addHeader('2. DADOS DO SEGUNDO PROPONENTE');
    addField('Relacionamento', data.p2Relationship);
    const p2 = data.p2;
    addField('Nome Completo', p2.fullName);
    addField('CPF', p2.cpf);
    addField('RG', p2.rg);
    addField('Sexo', p2.gender);
    addField('Data de Nascimento', p2.dob);
    addField('Nome da Mãe', p2.motherName);
    addField('Email Principal', p2.email);
    addField('Telefone Celular', p2.phoneMobile);
    
    addHeader('Residência (P2)');
    addField('Tipo', p2.residenceType);
    addField('Endereço', p2.residenceAddress);

    addHeader('Dados Profissionais (P2)');
    addField('Profissão', p2.profession);
    addField('Empresa', p2.company);
    addField('Salário', `R$ ${p2.salary}`);
  }

  yPos += 5;
  addHeader('3. ANÁLISE DE CRÉDITO');
  addField('Já usou FGTS', data.usedFgts);
  addField('Subsídio FGTS', data.fgtsSubsidy);
  addField('Possui Imóvel', data.ownsProperty);
  if (data.ownsProperty === 'sim') {
    addField('Endereço do Imóvel', data.propertyAddress);
    addField('Fração (%)', data.propertyFraction);
  }
  addField('Outros Bens', data.otherAssets);
  addField('Endereço Imóvel Pretendido', data.targetPropertyAddress);
  addField('Vagas de Garagem', data.parkingSpaces);

  yPos += 5;
  addHeader('4. VALORES DA OPERAÇÃO');
  addField('Valor de Venda', `R$ ${data.saleValue}`);
  addField('Entrada', `R$ ${data.downPayment}`);
  addField('Usará FGTS', data.useFgts);
  if (data.useFgts === 'sim') {
    addField('Valor FGTS', `R$ ${data.fgtsValue}`);
  }
  addField('Valor Financiamento', `R$ ${data.financingValue}`);
  addField('Prazo (Anos)', data.termYears);
  addField('Sistema de Amortização', data.amortizationSystem);

  yPos += 15;
  checkPage(30);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Declaração: O proponente declarou que as informações são verdadeiras e', margin, yPos);
  doc.text('autorizou a busca de dados nos Órgãos de Proteção ao Crédito.', margin, yPos + 5);

  doc.save(`Ficha_Fourcred_${data.p1.cpf}.pdf`);
};
