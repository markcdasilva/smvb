import React, { useState } from 'react';
import { X, Download, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { encrypt } from '../../lib/encryption';

interface ViewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
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
  };
  isEditing: boolean;
  onSave: () => void;
  onDownload: (filePath: string, fileName: string) => void;
}

export function ViewEditModal({ isOpen, onClose, company, isEditing, onSave, onDownload }: ViewEditModalProps) {
  const [formData, setFormData] = useState(company);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setSaving(true);
      setError(null);

      // Update company data
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          company_name: encrypt(formData.company_name),
          cvr: encrypt(formData.cvr),
          employees: formData.employees,
          contact_person: encrypt(formData.contact_person),
          email: encrypt(formData.email),
          data_period_start: formData.data_period_start,
          data_period_end: formData.data_period_end
        })
        .eq('id', company.id);

      if (updateError) throw updateError;

      // Handle file upload if a new file is selected
      if (selectedFile) {
        // Delete existing file if it exists
        if (company.file_uploads) {
          await supabase.storage
            .from('kreditorlister')
            .remove([company.file_uploads.file_path]);
        }

        // Upload new file
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${company.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kreditorlister')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Update or create file upload record
        const fileData = {
          company_id: company.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          file_path: filePath
        };

        if (company.file_uploads) {
          const { error: fileUpdateError } = await supabase
            .from('file_uploads')
            .update(fileData)
            .eq('company_id', company.id);

          if (fileUpdateError) throw fileUpdateError;
        } else {
          const { error: fileInsertError } = await supabase
            .from('file_uploads')
            .insert([fileData]);

          if (fileInsertError) throw fileInsertError;
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError(err.message || 'Der opstod en fejl under gem. Prøv igen senere.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Rediger virksomhed' : 'Virksomhedsdetaljer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Virksomhedsnavn
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVR
              </label>
              <input
                type="text"
                value={formData.cvr}
                onChange={(e) => setFormData({ ...formData, cvr: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Antal ansatte
              </label>
              <input
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kontaktperson
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Regnskabsperiode start
              </label>
              <input
                type="date"
                value={formData.data_period_start}
                onChange={(e) => setFormData({ ...formData, data_period_start: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Regnskabsperiode slut
              </label>
              <input
                type="date"
                value={formData.data_period_end}
                onChange={(e) => setFormData({ ...formData, data_period_end: e.target.value })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Kreditorliste
              </label>
              {company.file_uploads ? (
                <div className="mt-1 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {company.file_uploads.file_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDownload(company.file_uploads!.file_path, company.file_uploads!.file_name)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Ingen fil uploadet</p>
              )}
              {isEditing && (
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".csv,.xls,.xlsx"
                />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Gemmer...' : 'Gem ændringer'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}