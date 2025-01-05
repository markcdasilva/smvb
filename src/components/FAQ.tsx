import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none group"
        onClick={onClick}
      >
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-8' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed px-8">{answer}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs = [
    {
      question: 'Hvad er formålet med SMV Benchmark?',
      answer: 'SMV Benchmark giver dig indsigt i, hvordan dine omkostninger ligger i forhold til andre virksomheder i din branche. Dette giver dig et stærkt udgangspunkt for at optimere dine udgifter og forhandle bedre aftaler med dine leverandører.'
    },
    {
      question: 'Er mine data sikre?',
      answer: 'Absolut. SMV Benchmark bruger den højeste krypteringsstandard (AES-256) til at beskytte dine data, og alle oplysninger behandles fortroligt i overensstemmelse med GDPR. Din data bliver kun brugt i anonymiseret form til benchmarking, og du har altid fuld kontrol over dine oplysninger.'
    },
    {
      question: 'Hvad koster det?',
      answer: 'SMV Benchmark er 100% gratis at bruge. Det er startet for at hjælpe små og mellemstore danske virksomheder, inklusiv vores egen, med at blive mere konkurrencedygtige. Der er ingen skjulte gebyrer eller fremtidige omkostninger.'
    },
    {
      question: 'Kan jeg købe rapporten uden at bidrage til undersøgelsen?',
      answer: 'Nej. Det er kun muligt at få en rapport ved at bidrage til undersøgelsen.'
    },
    {
      question: 'Hvornår får jeg min rapport?',
      answer: 'Du kan forvente at modtage din rapport i løbet af 2025 – og senest tre måneder efter indsendelse.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Spørgsmål og svar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find svar på de mest almindelige spørgsmål om SMV Benchmark
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={index === openIndex}
              onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}