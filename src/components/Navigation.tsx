import React, { useState } from 'react';
import { Menu, TrendingUp, X } from 'lucide-react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
              <TrendingUp className="h-6 w-6" />
              <span>SMV Benchmark</span>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('om-undersogelsen')} 
              className="text-gray-600 hover:text-gray-900"
            >
              Om undersøgelsen
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-gray-600 hover:text-gray-900"
            >
              Spørgsmål og svar
            </button>
            <button 
              onClick={() => scrollToSection('kontakt')} 
              className="text-gray-600 hover:text-gray-900"
            >
              Kontakt
            </button>
            <button
              onClick={() => scrollToSection('benchmark-form')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start dit benchmark
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection('om-undersogelsen')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Om undersøgelsen
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Spørgsmål og svar
              </button>
              <button
                onClick={() => scrollToSection('kontakt')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Kontakt
              </button>
              <button
                onClick={() => scrollToSection('benchmark-form')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Start dit benchmark
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}