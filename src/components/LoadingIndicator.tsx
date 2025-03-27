
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
      </div>
      <p className="mt-4 text-gray-500">Procesando PDF y buscando códigos QR...</p>
    </div>
  );
};

export default LoadingIndicator;
