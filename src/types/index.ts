export interface CompanyData {
  companyName: string;
  cvr: string;
  employees: number;
  contactPerson: string;
  email: string;
  kreditorliste?: File;
  dataPeriodStart: Date;
  dataPeriodEnd: Date;
}