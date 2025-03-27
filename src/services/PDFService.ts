
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface QRCodeResult {
  data: string;
  pageNumber: number;
  thumbnail: string; // Base64 encoded image
}

export const extractQRCodesFromPDF = async (file: File): Promise<QRCodeResult[]> => {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
    const results: QRCodeResult[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Canvas context is null');
        continue;
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Find QR codes
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (qrCode) {
        // Create thumbnail
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = 200;
        thumbnailCanvas.height = 200 * (canvas.height / canvas.width);
        
        if (thumbnailCtx) {
          thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          const thumbnail = thumbnailCanvas.toDataURL('image/png');

          results.push({
            data: qrCode.data,
            pageNumber: pageNum,
            thumbnail
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};
