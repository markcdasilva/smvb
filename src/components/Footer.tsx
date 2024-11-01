import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-400">
          © {new Date().getFullYear()} SMV Benchmark. Alle rettigheder forbeholdes.
        </p>
      </div>
    </footer>
  );
}