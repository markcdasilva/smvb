import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';

export function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if we're returning from form submission
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('_success')) {
      setShowSuccess(true);
      // Remove the parameter from URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
      // Hide the message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <section id="kontakt" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Kontakt os</h2>
          <p className="mt-4 text-lg text-gray-600">
            Skriv endelig, hvis du har nogle spørgsmål.
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
            {showSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                Tak for din besked! Vi vender tilbage hurtigst muligt.
              </div>
            )}
            
            <form 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              action="https://formsubmit.co/kontakt@smvbenchmark.dk"
              method="POST"
            >
              {/* FormSubmit.co configuration */}
              <input type="hidden" name="_subject" value="Ny besked fra SMV Benchmark" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value={`${window.location.href}?_success=true`} />
              
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
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Send besked
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}