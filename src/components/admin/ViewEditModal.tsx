import React, { useState } from 'react';
import { X, Upload, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/auth';
import { encrypt } from '../../lib/encryption';

interface ViewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: string;
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
  };
  isEditing: boolean;
  onSave: () => void;
  onDownload: (filePath: string, fileName: string) => void;
}

export function ViewEditModal({ isOpen, onClose, company, isEditing, onSave, onDownload }: ViewEditModalProps) {
  const [formData, setFormData] = useState(company);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
    }
  };

  const handleDeleteFile = async () => {
    if (!company.file_uploads) return;
    
    try {
      const { error: storageError } = await supabase.storage
        .from('kreditorlister')
        .remove([company.file_uploads.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', company.file_uploads.id);

      if (dbError) throw dbError;

      setFormData(prev => ({
        ...prev,
        file_uploads: null
      }));
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError('Kunne ikke slette filen. Prøv igen senere.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Er du sikker på, at du vil slette denne virksomhed? Dette kan ikke fortrydes.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (company.file_uploads) {
        await supabase.storage
          .from('kreditorlister')
          .remove([company.file_uploads.file_path]);
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (error) throw error;

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setError('Kunne ikke slette virksomheden. Prøv igen senere.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setSaving(true);
      setError(null);

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

      if (newFile) {
        const fileExt = newFile.name.split('.').pop();
        const filePath = `${company.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kreditorlister')
          .upload(filePath, newFile);

        if (uploadError) throw uploadError;

        const fileData = {
          company_id: company.id,
          file_name: newFile.name,
          file_size: newFile.size,
          mime_type: newFile.type,
          file_path: filePath
        };

        if (company.file_uploads) {
          const { error: fileUpdateError } = await supabase
            .from('file_uploads')
            .update(fileData)
            .eq('id', company.file_uploads.id);

          if (fileUpdateError) throw fileUpdateError;

          await supabase.storage
            .from('kreditorlister')
            .remove([company.file_uploads.file_path]);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Rediger virksomhed' : 'Virksomhedsdetaljer'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Virksomhedsnavn
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
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
                  name="cvr"
                  value={formData.cvr}
                  onChange={handleInputChange}
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
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
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
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="data_period_start"
                  value={formData.data_period_start}
                  onChange={handleInputChange}
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
                  name="data_period_end"
                  value={formData.data_period_end}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kreditorliste</h3>
              
              {formData.file_uploads ? (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <p className="font-medium text-gray-900">{formData.file_uploads.file_name}</p>
                    <button
                      type="button"
                      onClick={() => onDownload(formData.file_uploads!.file_path, formData.file_uploads!.file_name)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Download fil"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDeleteFile}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : isEditing ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv,.xls,.xlsx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Klik for at uploade ny fil
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-gray-500 italic">Ingen fil uploadet</p>
              )}
            </div>

            <div className="flex justify-between space-x-4 mt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Slet virksomhed
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  {isEditing ? 'Annuller' : 'Luk'}
                </button>
                
                {isEditing && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={saving}
                  >
                     {saving ? 'Gemmer...' : 'Gem ændringer'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}