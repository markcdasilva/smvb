import React from 'react';
import { Users, BarChart2, TrendingUp } from 'lucide-react';

export function About() {
  return (
    <section id="om-undersogelsen" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Om undersøgelsen</h2>
          <div className="mt-4 max-w-3xl mx-auto">
            <p className="text-lg text-gray-600">
              Få indsigt i din virksomheds omkostninger og optimer din bundlinje
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-600 leading-relaxed">
              Mit navn er Mark, og jeg er CFO i dansk familieejet SMV indenfor medicoteknologi. 
              Efter mange års erfaring med leverandørforhandlinger har jeg set, at mange virksomheder 
              betaler vidt forskellige priser for samme ydelser – og de fleste små og mellemstore 
              virksomheder får ofte lov til at betale mest.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Derfor har jeg skabt SMV Benchmark – et 100% gratis værktøj, der hjælper små og mellemstore 
              virksomheder, inklusiv vores egen, med at optimere deres omkostninger gennem anonymiseret 
              sammenligning med andre virksomheder.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Jeg håber, at I har lyst til at være med.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Users className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">+100 virksomheder</h3>
              <p className="text-gray-600">Forventes at deltage i benchmark-programmet</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <BarChart2 className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">+50 leverandører</h3>
              <p className="text-gray-600">Forventes at blive sammenlignet i programmet</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Op til 20% besparelse</h3>
              <p className="text-gray-600">Gennemsnitlig forventet omkostningsreduktion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}