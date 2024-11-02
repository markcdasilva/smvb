import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';
import { Download, Trash2, Eye, Filter, RefreshCw, Edit, X } from 'lucide-react';
import { decrypt } from '../../lib/encryption';
import { ViewEditModal } from './ViewEditModal';

interface Company {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  cvr: string;
  employees: number;
  contact_person: string;
  email: string;
  data_period_start: string;
  data_period_end: string;
  ip_address: string | null;
  user_agent: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  file_uploads?: {
    id: string;
    file_name: string;
    file_path: string;
  } | null;
}

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Company;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      const decryptedData = data.map(company => ({
        ...company,
        company_name: decrypt(company.company_name),
        cvr: decrypt(company.cvr),
        contact_person: decrypt(company.contact_person),
        email: decrypt(company.email),
      }));

      setCompanies(decryptedData);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
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
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Kunne ikke slette virksomheden. Prøv igen senere.');
    }
  };

  const handleSort = (key: keyof Company) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      return sortConfig.direction === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const filteredCompanies = sortedCompanies.filter(company => {
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
      <div className="flex justify-between items-center">
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
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
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
                  onClick={() => handleSort('id')}
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  Dato
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('company_name')}
                >
                  Virksomhed
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Indlæser...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Ingen virksomheder fundet
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company, index) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
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
                      <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                      <div className="text-sm text-gray-500">CVR: {company.cvr}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {company.file_uploads && (
                          <button
                            onClick={() => handleDownload(company.file_uploads!.file_path, company.file_uploads!.file_name)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download fil"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsModalOpen(true);
                            setIsEditing(false);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Vis detaljer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsModalOpen(true);
                            setIsEditing(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Rediger"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Slet"
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