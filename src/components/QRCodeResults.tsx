
import React from 'react';
import { QRCodeResult } from '@/services/PDFService';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';

interface QRCodeResultsProps {
  results: QRCodeResult[];
  onReset: () => void;
}

const QRCodeResults: React.FC<QRCodeResultsProps> = ({ results, onReset }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El texto ha sido copiado al portapapeles",
    });
  };

  const isValidURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(results.map(r => ({ data: r.data, page: r.pageNumber })), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, 'qr-codes.json');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resultados ({results.length})</h2>
        <div className="space-x-2">
          <Button onClick={exportAsJSON} variant="outline" size="sm">
            Exportar JSON
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            Nuevo análisis
          </Button>
        </div>
      </div>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Página {result.pageNumber}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(result.data)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 p-4">
                  <img 
                    src={result.thumbnail} 
                    alt={`Thumbnail page ${result.pageNumber}`}
                    className="w-full aspect-square object-contain"
                  />
                </div>
                <div className="md:w-2/3 p-4 overflow-hidden">
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all max-h-28 overflow-y-auto">
                    {result.data}
                  </div>
                  
                  {isValidURL(result.data) && (
                    <div className="mt-4">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => window.open(result.data, '_blank')}
                        className="w-full"
                      >
                        Abrir enlace
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-lg text-gray-500">No se encontraron códigos QR en el PDF</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeResults;
