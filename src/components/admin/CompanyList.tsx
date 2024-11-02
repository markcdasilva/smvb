import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/auth';
import { Download, Pencil, Eye, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { decrypt } from '../../lib/encryption';
import { ViewEditModal } from './ViewEditModal';

interface Company {
  id: string;
  created_at: string;
  company_name: string;
  cvr: string;
  employees: number;
  contact_person: string;
  email: string;
  data_period_start: string;
  data_period_end: string;
  file_uploads?: {
    id: string;
    file_name: string;
    file_path: string;
  } | null;
}

type SortField = 'index' | 'created_at' | 'company_name' | 'cvr' | 'employees' | 'contact_person' | 'email' | 'data_period_start';
type SortDirection = 'asc' | 'desc';

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          file_uploads (
            id,
            file_name,
            file_path
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data) {
        setCompanies([]);
        return;
      }

      const decryptedData = data.map((company, index) => ({
        ...company,
        index: data.length - index, // Add index in reverse order
        company_name: decrypt(company.company_name),
        cvr: decrypt(company.cvr),
        contact_person: decrypt(company.contact_person),
        email: decrypt(company.email),
      }));

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

    const subscription = supabase
      .channel('companies_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'companies' 
      }, () => {
        fetchCompanies();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortCompanies = (a: any, b: any) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'index') {
      return (a.index - b.index) * direction;
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    
    return (aValue - bValue) * direction;
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('kreditorlister')
        .download(filePath);

      if (downloadError) throw downloadError;

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline-block ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const filteredCompanies = companies
    .filter(company => 
      searchTerm === '' || 
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cvr.includes(searchTerm) ||
      company.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortCompanies);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Søg efter virksomhed, CVR, kontakt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-80"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <button
          onClick={fetchCompanies}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Opdater liste
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
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
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('index')}
                >
                  #<SortIcon field="index" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  Dato<SortIcon field="created_at" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('company_name')}
                >
                  Virksomhed<SortIcon field="company_name" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('cvr')}
                >
                  CVR<SortIcon field="cvr" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('contact_person')}
                >
                  Kontaktperson<SortIcon field="contact_person" />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  Email<SortIcon field="email" />
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Indlæser...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Ingen virksomheder fundet
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{company.index}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {company.company_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.cvr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.contact_person}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-4">
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
                          onClick={() => handleView(company)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Vis detaljer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Rediger"
                        >
                          <Pencil className="w-5 h-5" />
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

      {selectedCompany && (
        <ViewEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCompany(null);
            setIsEditing(false);
          }}
          company={selectedCompany}
          isEditing={isEditing}
          onSave={fetchCompanies}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}