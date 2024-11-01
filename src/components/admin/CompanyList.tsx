import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';
import { Download, Trash2, Eye, Filter, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { decrypt } from '../../lib/encryption';

interface Company {
  id: string;
  created_at: string;
  company_name: string;
  cvr: string;
  employees: number;
  contact_person: string;
  email: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  file_uploads?: {
    file_name: string;
    file_path: string;
  } | null;
}

const STATUS_ICONS = {
  PENDING: <Clock className="w-4 h-4 text-gray-500" />,
  PROCESSING: <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-green-500" />,
  ERROR: <AlertCircle className="w-4 h-4 text-red-500" />
};

const STATUS_STYLES = {
  PENDING: 'bg-gray-100 text-gray-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800'
};

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching companies...');
      console.log('Using Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          file_uploads (
            file_name,
            file_path
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(`Failed to fetch companies: ${fetchError.message}`);
      }

      console.log('Raw data from Supabase:', data);

      if (!data) {
        setCompanies([]);
        return;
      }

      // Decrypt sensitive data
      const decryptedData = data.map(company => {
        try {
          return {
            ...company,
            company_name: decrypt(company.company_name),
            cvr: decrypt(company.cvr),
            contact_person: decrypt(company.contact_person),
            email: decrypt(company.email),
          };
        } catch (decryptError) {
          console.error('Decryption error for company:', company.id, decryptError);
          return company; // Return raw data if decryption fails
        }
      });

      console.log('Decrypted data:', decryptedData);
      setCompanies(decryptedData);
    } catch (err: any) {
      console.error('Error in fetchCompanies:', err);
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();

    // Set up real-time subscription
    const subscription = supabase
      .channel('companies_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'companies' 
      }, (payload) => {
        console.log('Real-time update received:', payload);
        fetchCompanies();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [statusFilter]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      console.log('Downloading file:', filePath);
      const { data, error: downloadError } = await supabase.storage
        .from('kreditorlister')
        .download(filePath);

      if (downloadError) {
        console.error('Download error:', downloadError);
        throw downloadError;
      }

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Kunne ikke downloade filen. Prøv igen senere.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på, at du vil slette denne virksomhed? Dette kan ikke fortrydes.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCompanies(companies.filter(company => company.id !== id));
      setSelectedCompanies(selectedCompanies.filter(companyId => companyId !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Kunne ikke slette virksomheden. Prøv igen senere.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCompanies(prev =>
      prev.includes(id)
        ? prev.filter(companyId => companyId !== id)
        : [...prev, id]
    );
  };

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchTerm.toLowerCase();
    return (
      company.company_name.toLowerCase().includes(searchLower) ||
      company.cvr.includes(searchTerm) ||
      company.email.toLowerCase().includes(searchLower) ||
      company.contact_person.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Alle status</option>
            <option value="pending">Afventer</option>
            <option value="processing">Behandler</option>
            <option value="completed">Gennemført</option>
            <option value="error">Fejl</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Søg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <button
          onClick={fetchCompanies}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Opdater
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-semibold">Der opstod en fejl</h3>
          <p>{error}</p>
          <button 
            onClick={fetchCompanies}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Prøv igen
          </button>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                    onChange={() => {
                      if (selectedCompanies.length === filteredCompanies.length) {
                        setSelectedCompanies([]);
                      } else {
                        setSelectedCompanies(filteredCompanies.map(c => c.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Virksomhed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Indlæser...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Ingen virksomheder fundet
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => toggleSelect(company.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                      <div className="text-sm text-gray-500">CVR: {company.cvr}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.contact_person}</div>
                      <div className="text-sm text-gray-500">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[company.status]}`}>
                        {STATUS_ICONS[company.status]}
                        <span className="ml-1.5">{company.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString('da-DK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-end">
                        {company.file_uploads && (
                          <button
                            onClick={() => handleDownload(company.file_uploads!.file_path, company.file_uploads!.file_name)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Download fil"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Vis detaljer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Slet virksomhed"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}