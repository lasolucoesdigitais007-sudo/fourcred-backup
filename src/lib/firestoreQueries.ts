/**
 * Firestore Queries e Helpers
 * Arquivo de referência para queries comuns contra o Firestore
 * Use esses exemplos no Admin Dashboard
 */

import { firestore } from './firebase';
import type { FormData, Proponent } from '../types';

// ============ SUBMISSIONS ============

/**
 * Salvar uma submissão de formulário
 */
export async function saveSubmission(data: FormData) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  const clientCpf = data.p1?.cpf?.replace(/\D/g, '') || 'unknown';
  
  const submission = {
    clientId: clientCpf,
    p1: data.p1,
    hasP2: data.hasP2,
    p2Relationship: data.p2Relationship || null,
    p2: data.p2 || null,
    creditAnalysis: {
      usedFgts: data.usedFgts,
      fgtsSubsidy: data.fgtsSubsidy,
      ownsProperty: data.ownsProperty,
      propertyAddress: data.propertyAddress || null,
      propertyFraction: data.propertyFraction || null,
      otherAssets: data.otherAssets,
    },
    operation: {
      targetPropertyAddress: data.targetPropertyAddress,
      parkingSpaces: data.parkingSpaces,
      saleValue: data.saleValue,
      downPayment: data.downPayment,
      useFgts: data.useFgts,
      fgtsValue: data.fgtsValue || null,
      financingValue: data.financingValue,
      termYears: data.termYears,
      amortizationSystem: data.amortizationSystem,
    },
    acceptedTerms: data.acceptedTerms,
    submittedAt: new Date(data.submittedAt),
    createdAt: new Date(),
  };

  try {
    // Salvar em submissões
    const docRef = await firestore.collection('submissions').add(submission);
    
    // Atualizar cliente
    const clientRecord = {
      updatedAt: new Date(),
      latestSubmissionId: docRef.id,
      p1: data.p1,
      p2: data.p2 || null,
      hasP2: data.hasP2,
      cpf: data.p1?.cpf || '',
      fullName: data.p1?.fullName || '',
      email: data.p1?.email || '',
      phoneMobile: data.p1?.phoneMobile || '',
      preferredContact: 'email',
      status: 'pendente', // status padrão
    };
    
    await firestore.collection('clients').doc(clientCpf).set(clientRecord, { merge: true });
    
    // Atualizar propriedade (incrementar contador)
    const propertyId = data.targetPropertyAddress?.replace(/\s+/g, '-').toLowerCase() || 'unknown';
    await firestore.collection('properties').doc(propertyId).set(
      {
        address: data.targetPropertyAddress,
        city: data.targetPropertyAddress?.split(',')[1]?.trim() || '',
        saleValue: data.saleValue,
        submissionsCount: firestore.FieldValue.increment(1),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar submissão:', error);
    throw error;
  }
}

// ============ QUERIES - ADMIN DASHBOARD ============

/**
 * Listar submissões de um cliente específico
 */
export async function getClientSubmissions(
  clientCpf: string,
  limit: number = 10
) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const snapshot = await firestore
      .collection('submissions')
      .where('clientId', '==', clientCpf)
      .orderBy('submittedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar submissões:', error);
    return [];
  }
}

/**
 * Listar clientes em análise (status) com paginação
 */
export async function getClientsByStatus(
  status: string = 'pendente',
  limit: number = 20,
  startAfter?: any
) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    let query = firestore
      .collection('clients')
      .where('status', '==', status)
      .orderBy('updatedAt', 'desc');

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return [];
  }
}

/**
 * Obter detalhes de um cliente
 */
export async function getClient(clientCpf: string) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const doc = await firestore.collection('clients').doc(clientCpf).get();
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}

/**
 * Atualizar status de um cliente
 */
export async function updateClientStatus(
  clientCpf: string,
  status: 'pendente' | 'analise' | 'aprovado' | 'rejeitado'
) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    await firestore.collection('clients').doc(clientCpf).update({
      status,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
}

/**
 * Listar submissões recentes (últimas 24h)
 */
export async function getRecentSubmissions(hoursAgo: number = 24) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    const snapshot = await firestore
      .collection('submissions')
      .where('submittedAt', '>=', cutoffDate)
      .orderBy('submittedAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar submissões recentes:', error);
    return [];
  }
}

/**
 * Contar clientes por status
 */
export async function getClientCountByStatus() {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const statuses = ['pendente', 'analise', 'aprovado', 'rejeitado'];
    const counts: Record<string, number> = {};

    for (const status of statuses) {
      const snapshot = await firestore
        .collection('clients')
        .where('status', '==', status)
        .count()
        .get();
      counts[status] = snapshot.data().count;
    }

    return counts;
  } catch (error) {
    console.error('Erro ao contar clientes:', error);
    return {};
  }
}

/**
 * Buscar propriedades mais procuradas
 */
export async function getTopProperties(limit: number = 10) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const snapshot = await firestore
      .collection('properties')
      .where('submissionsCount', '>', 0)
      .orderBy('submissionsCount', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar propriedades:', error);
    return [];
  }
}

/**
 * Buscar clientes por nome ou CPF
 */
export async function searchClients(query: string) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    // Firestore não tem busca full-text nativa
    // Esta é uma busca simples que obtém todos os clientes e filtra no código
    // Para produção, considere usar Algolia ou Firebase Extensions
    
    const snapshot = await firestore.collection('clients').limit(100).get();
    
    const results = snapshot.docs.filter(doc => {
      const data = doc.data() as any;
      const searchLower = query.toLowerCase();
      
      return (
        data.fullName?.toLowerCase().includes(searchLower) ||
        data.cpf?.includes(query) ||
        data.email?.toLowerCase().includes(searchLower)
      );
    });

    return results.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

/**
 * Salvar um arquivo/documento para um cliente
 * (Requer integração com Cloud Storage)
 */
export async function saveClientDocument(
  clientCpf: string,
  documentType: 'rg' | 'cpf' | 'salary_proof' | 'other',
  fileUrl: string
) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const doc = {
      type: documentType,
      url: fileUrl,
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore
      .collection('clients')
      .doc(clientCpf)
      .collection('documents')
      .doc(documentType)
      .set(doc, { merge: true });

    return true;
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    return false;
  }
}

/**
 * Listar documentos de um cliente
 */
export async function getClientDocuments(clientCpf: string) {
  if (!firestore) throw new Error('Firestore não configurado');
  
  try {
    const snapshot = await firestore
      .collection('clients')
      .doc(clientCpf)
      .collection('documents')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    return [];
  }
}

/**
 * Exportar dados de um cliente para PDF (referência)
 * Use jsPDF para gerar o PDF com dados do cliente
 */
export async function exportClientToPdf(clientCpf: string) {
  const client = await getClient(clientCpf);
  const submissions = await getClientSubmissions(clientCpf);
  
  if (!client) throw new Error('Cliente não encontrado');
  
  // Aqui você usaria jsPDF para criar um PDF
  // Este é apenas um exemplo de estrutura
  console.log('Exportando cliente:', client);
  console.log('Submissões:', submissions);
  
  // return generatePdf(client, submissions);
}

// ============ HELPERS ============

/**
 * Formatar CPF para exibição
 */
export function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar moeda para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formatar data
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
