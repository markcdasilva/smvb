import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { FileUpload } from './FileUpload';
import type { CompanyData, FormStatus } from '../types';
import { supabase } from '../lib/supabase-client';

const getInitialDates = () => {
  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return { start, end };
};

const INITIAL_DATA: CompanyData = {
  companyName: '',
  cvr: '',
  employees: 0,
  contactPerson: '',
  email: '',
  dataPeriodStart: getInitialDates().start,
  dataPeriodEnd: getInitialDates().end,
};

export function MultiStepForm() {
  const [data, setData] = useState(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateFields = (fields: Partial<CompanyData>) => {
    setData(prev => {
      const newData = { ...prev, ...fields };
      
      // If start date is updated, adjust end date
      if (fields.dataPeriodStart) {
        const endDate = new Date(fields.dataPeriodStart);
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1);
        newData.dataPeriodEnd = endDate;
      }
      
      return newData;
    });
  };

  const next = () => {
    setCurrentStep(i => (i >= 2 ? i : i + 1));
  };

  const back = () => {
    setCurrentStep(i => (i <= 0 ? i : i - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) {
      next();
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      // Insert company data
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          company_name: data.companyName,
          cvr: data.cvr,
          employees: data.employees,
          contact_person: data.contactPerson,
          email: data.email,
          data_period_start: data.dataPeriodStart.toISOString().split('T')[0],
          data_period_end: data.dataPeriodEnd.toISOString().split('T')[0],
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          status: 'PENDING'
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // If there's a file, upload it
      if (data.kreditorliste && company) {
        const fileExt = data.kreditorliste.name.split('.').pop();
        const filePath = `${company.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kreditorlister')
          .upload(filePath, data.kreditorliste);

        if (uploadError) throw uploadError;

        // Create file upload record
        const { error: fileRecordError } = await supabase
          .from('file_uploads')
          .insert([{
            company_id: company.id,
            file_name: data.kreditorliste.name,
            file_size: data.kreditorliste.size,
            mime_type: data.kreditorliste.type,
            file_path: filePath
          }]);

        if (fileRecordError) throw fileRecordError;
      }

      setStatus('success');
      // Reset form
      setData(INITIAL_DATA);
      setCurrentStep(0);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Der opstod en fejl. Prøv venligst igen.');
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <StepIndicator currentStep={currentStep} totalSteps={3} />
      
      {status === 'success' ? (
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-green-600 mb-4">
            Tak for din indsendelse!
          </h3>
          <p className="text-gray-600">
            Vi behandler dine data og vender tilbage med din benchmark-rapport hurtigst muligt.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Virksomhedsoplysninger</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Virksomhedsnavn
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={data.companyName}
                    onChange={e => updateFields({ companyName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="SMV ApS"
                  />
                </div>
                <div>
                  <label htmlFor="cvr" className="block text-sm font-medium text-gray-700">
                    CVR Nummer
                  </label>
                  <input
                    type="text"
                    id="cvr"
                    value={data.cvr}
                    onChange={e => updateFields({ cvr: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="12345678"
                    pattern="\d{8}"
                    title="CVR nummer skal være 8 cifre"
                  />
                </div>
                <div>
                  <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
                    Antal ansatte
                  </label>
                  <input
                    type="number"
                    id="employees"
                    value={data.employees || ''}
                    onChange={e => updateFields({ employees: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="1"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Kontaktoplysninger</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                    Kontaktperson
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    value={data.contactPerson}
                    onChange={e => updateFields({ contactPerson: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="Anders Andersen"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={data.email}
                    onChange={e => updateFields({ email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="kontakt@smv.dk"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Kreditorliste</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataPeriodStart" className="block text-sm font-medium text-gray-700">
                      Regnskabsperiode start
                    </label>
                    <input
                      type="date"
                      id="dataPeriodStart"
                      value={data.dataPeriodStart.toISOString().split('T')[0]}
                      onChange={e => updateFields({ dataPeriodStart: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="dataPeriodEnd" className="block text-sm font-medium text-gray-700">
                      Regnskabsperiode slut
                    </label>
                    <input
                      type="date"
                      id="dataPeriodEnd"
                      value={data.dataPeriodEnd.toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Slutdato beregnes automatisk (1 år minus 1 dag)
                    </p>
                  </div>
                </div>
              </div>

              <FileUpload
                onFileSelect={(file) => updateFields({ kreditorliste: file })}
                selectedFile={data.kreditorliste}
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={back}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbage
              </button>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`flex items-center ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                status === 'submitting' ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {status === 'submitting' ? (
                'Behandler...'
              ) : currentStep === 2 ? (
                'Send'
              ) : (
                <>
                  Næste
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}