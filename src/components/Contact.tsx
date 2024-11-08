import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setStatus('submitting');
    setError(null);

    try {
      const form = e.currentTarget;
      const data = new FormData(form);

      const response = await fetch('https://formsubmit.co/ajax/kontakt@smvbenchmark.dk', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: data
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setStatus('success');
      form.reset();
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError('Der opstod en fejl. Prøv at sende en mail direkte til kontakt@smvbenchmark.dk');
      setStatus('error');
    }
  };

  return (
    <section id="kontakt" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Kontakt os</h2>
          <p className="mt-4 text-lg text-gray-600">
            Skriv endelig, hvis du har nogle spørgsmål :-)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">E-mail</h3>
                  <a 
                    href="mailto:kontakt@smvbenchmark.dk"
                    className="mt-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    kontakt@smvbenchmark.dk
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              action="https://formsubmit.co/kontakt@smvbenchmark.dk"
              method="POST"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="_subject" value="Ny besked fra SMV Benchmark" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value={window.location.href} />
              
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-xl font-semibold mb-2">
                    Tak for din besked!
                  </div>
                  <p className="text-gray-600">
                    Vi vender tilbage til dig hurtigst muligt.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Navn
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Emne
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Besked
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-75"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sender...
                        </>
                      ) : (
                        'Send besked'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}