
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onFileUploaded: (file: File) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const validateAndProcessFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive"
      });
      return;
    }
    
    onFileUploaded(file);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 ${
          dragActive ? 'border-primary' : 'border-gray-300'
        } transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <p className="text-sm text-center text-gray-500">
            Arrastra y suelta tu archivo PDF aquí, o{' '}
            <button 
              type="button"
              className="text-primary hover:text-primary/80 focus:outline-none"
              onClick={handleButtonClick}
            >
              navega
            </button>{' '}
            para seleccionar un archivo
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Procesando...' : 'Seleccionar PDF'}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
