import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative bg-blue-900 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Er dine udgifter højere end konkurrenternes?
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Få gratis indsigt i hvordan dine omkostninger ligger i forhold til andre virksomheder i din branche, og find ud af hvor du kan spare penge.
        </p>
        <button
          onClick={onGetStarted}
          className="group bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors duration-200 inline-flex items-center"
        >
          Start gratis benchmark
          <ArrowRight className="ml-2 h-5 w-5 animate-[bounce-x_1s_infinite]" />
        </button>
      </div>
    </div>
  );
}