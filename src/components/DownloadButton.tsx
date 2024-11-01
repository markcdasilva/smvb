import React from 'react';
import { Download } from 'lucide-react';

export function DownloadButton() {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download project. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
    >
      <Download className="w-5 h-5" />
      <span>Download Project</span>
    </button>
  );
}