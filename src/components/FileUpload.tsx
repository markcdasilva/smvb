import React, { useCallback } from 'react';
import { Upload, FileWarning, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | undefined;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length) {
        const file = files[0];
        if (isValidFileType(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const file = files[0];
      if (isValidFileType(file)) {
        onFileSelect(file);
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/plain',
      'text/x-csv'
    ];
    return validTypes.includes(file.type);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200"
      >
        <input
          type="file"
          id="kreditorliste"
          onChange={handleFileSelect}
          accept=".csv,.xls,.xlsx"
          className="hidden"
        />
        <label
          htmlFor="kreditorliste"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Træk din fil hertil eller klik for at vælge
            </p>
            <p className="text-sm text-gray-500">
              Understøttede filtyper: CSV, XLS, XLSX (Max. 10MB)
            </p>
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
            <p className="text-sm text-blue-700">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <FileWarning className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Vigtig information om kreditorlisten:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Listen skal indeholde så mange leverandører som muligt for at få det bedste grundlag for jeres benchmark</li>
              <li>Listen skal indeholde følgende kolonner med én kreditor per række (Kreditors CVR nummer, kreditors selskabsnavn og årlige omkostninger til kreditor)</li>
              <li>Vælg den korrekte startdato for dataperioden ovenfor</li>
              <li>Alle beløb skal være i DKK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}