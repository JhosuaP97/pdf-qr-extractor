
import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import QRCodeResults from '@/components/QRCodeResults';
import LoadingIndicator from '@/components/LoadingIndicator';
import Header from '@/components/Header';
import { extractQRCodesFromPDF, QRCodeResult } from '@/services/PDFService';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [results, setResults] = useState<QRCodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileProcessed, setFileProcessed] = useState(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setFileProcessed(false);
    
    try {
      const qrCodes = await extractQRCodesFromPDF(file);
      setResults(qrCodes);
      
      if (qrCodes.length === 0) {
        toast({
          title: "No se encontraron QR",
          description: "No se encontraron códigos QR en el PDF seleccionado",
        });
      } else {
        toast({
          title: "Análisis completado",
          description: `Se encontraron ${qrCodes.length} código(s) QR`,
        });
      }
    } catch (error) {
      console.error("Error extracting QR codes:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setFileProcessed(true);
    }
  };

  const handleReset = () => {
    setResults([]);
    setFileProcessed(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!fileProcessed && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Extractor de QR en PDF</h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Sube un archivo PDF y extraeremos todos los códigos QR que contenga, mostrándote su contenido.
              </p>
            </div>
          )}
          
          {!fileProcessed && !loading && (
            <FileUploader onFileUploaded={handleFileUpload} isProcessing={loading} />
          )}
          
          {loading && <LoadingIndicator />}
          
          {fileProcessed && !loading && (
            <QRCodeResults results={results} onReset={handleReset} />
          )}
        </div>
      </main>
      
      <footer className="border-t py-4 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          PDF QR Extractor &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
