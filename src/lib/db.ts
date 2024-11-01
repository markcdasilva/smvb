import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from './encryption';
import type { Database } from './database.types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function createCompany(data: {
  companyName: string;
  cvr: string;
  employees: number;
  contactPerson: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const encryptedData = {
    company_name: encrypt(data.companyName),
    cvr: encrypt(data.cvr),
    employees: data.employees,
    contact_person: encrypt(data.contactPerson),
    email: encrypt(data.email),
    ip_address: data.ipAddress,
    user_agent: data.userAgent,
    status: 'PENDING'
  };

  const { data: company, error } = await supabase
    .from('companies')
    .insert([encryptedData])
    .select()
    .single();

  if (error) throw error;
  return company;
}

export async function createFileUpload(data: {
  companyId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
}) {
  const { data: fileUpload, error } = await supabase
    .from('file_uploads')
    .insert([{
      company_id: data.companyId,
      file_name: data.fileName,
      file_size: data.fileSize,
      mime_type: data.mimeType,
      file_path: data.filePath
    }])
    .select()
    .single();

  if (error) throw error;
  return fileUpload;
}

export async function getCompanyById(id: string) {
  const { data: company, error } = await supabase
    .from('companies')
    .select('*, file_uploads(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!company) return null;

  return {
    ...company,
    company_name: decrypt(company.company_name),
    cvr: decrypt(company.cvr),
    contact_person: decrypt(company.contact_person),
    email: decrypt(company.email),
  };
}

export async function updateCompanyStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR') {
  const { error } = await supabase
    .from('companies')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}