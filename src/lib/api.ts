import { supabase } from './supabase-client';
import { encrypt } from './encryption';
import type { CompanyData } from '../types';

export async function saveCompanyData(data: Partial<CompanyData>) {
  try {
    const encryptedData = {
      company_name: data.companyName ? encrypt(data.companyName) : undefined,
      cvr: data.cvr ? encrypt(data.cvr) : undefined,
      employees: data.employees,
      contact_person: data.contactPerson ? encrypt(data.contactPerson) : undefined,
      email: data.email ? encrypt(data.email) : undefined,
      ip_address: window.location.hostname,
      user_agent: navigator.userAgent,
      status: 'INCOMPLETE'
    };

    return await supabase.query(async () => {
      const { data: result, error } = await supabase
        .from('companies')
        .insert([encryptedData])
        .select()
        .single();

      if (error) throw error;
      return result;
    });
  } catch (error: any) {
    console.error('Error saving company data:', error);
    throw new Error(error.message || 'Failed to save company data. Please try again.');
  }
}