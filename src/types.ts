export interface Proponent {
  fullName: string;
  cpf: string;
  rg: string;
  gender: string;
  nationality: string;
  placeOfBirth: string;
  dob: string;
  motherName: string;
  maritalStatus: string;
  childrenCount: string;
  email: string;
  secondaryEmail?: string;
  phoneHome?: string;
  phoneMobile: string;
  phoneMessage?: string;
  educationLevel: string;
  
  // Residence
  residenceType: string;
  residenceTime: string;
  residenceAddress?: string; // mapping to street
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  hasFinancing: string;
  financingInstallment?: number;
  hasLoan: string;
  loanInstallment?: number;
  
  // Profession
  profession: string;
  company: string;
  isOwner: string;
  currentRole: string;
  serviceTime: string;
  salary: number;
  admissionDate: string;
  otherIncomes?: number;
  otherIncomesOrigin?: string;
}

export interface FormData {
  id: string;
  submittedAt: string;
  
  // Proponent 1
  p1: Proponent;

  // Proponent 2
  hasP2: boolean;
  p2Relationship?: string;
  p2?: Proponent;

  // Credit Analysis
  usedFgts: string;
  fgtsSubsidy: string;
  ownsProperty: string;
  propertyAddress?: string;
  propertyFraction?: number;
  otherAssets: string;
  targetPropertyAddress: string;
  parkingSpaces: string;

  // Operation Values
  saleValue: number;
  downPayment: number;
  useFgts: string;
  fgtsValue?: number;
  financingValue: number;
  termYears: number;
  amortizationSystem: string;

  // Terms
  acceptedTerms: boolean;
}
