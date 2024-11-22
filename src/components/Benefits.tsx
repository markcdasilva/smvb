import React from 'react';
import { PiggyBank, BarChart2, Handshake } from 'lucide-react';

export function Benefits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <PiggyBank className="h-8 w-8 text-blue-600" />
              <h3 className="ml-4 text-xl font-semibold">Skjulte besparelser</h3>
            </div>
            <p className="text-gray-600">
              Få konkret indsigt i dine indirekte omkostninger og find ud af, hvor du kan reducere udgifterne. Virksomheder kan typisk spare 20% per kategori, som triller direkte ned på bundlinjen.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <h3 className="ml-4 text-xl font-semibold">Øget konkurrenceevne</h3>
            </div>
            <p className="text-gray-600">
              Se hvordan dine omkostninger ligger i forhold til andre virksomheder i din branche, og styrk din markedsposition.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Handshake className="h-8 w-8 text-blue-600" />
              <h3 className="ml-4 text-xl font-semibold">Bedre forhandlinger</h3>
            </div>
            <p className="text-gray-600">
              Få præcise data om, hvad andre betaler for samme ydelser, og brug det som løftestang til at forhandle bedre aftaler med dine nuværende eller fremtidige leverandører.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}