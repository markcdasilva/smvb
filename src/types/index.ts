export interface CompanyData {
  companyName: string;
  cvr: string;
  employees: number;
  contactPerson: string;
  email: string;
  kreditorliste?: File;
  dataPeriodStart: string | null;
  dataPeriodEnd: string | null;
  status?: 'INCOMPLETE' | 'COMPLETE';
  acceptedTerms?: boolean;
}