
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

// Set up the worker locally instead of fetching from CDN
// This creates a worker bundle that's included in the application
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export interface QRCodeResult {
  data: string;
  pageNumber: number;
  thumbnail: string; // Base64 encoded image
}

export const extractQRCodesFromPDF = async (file: File): Promise<QRCodeResult[]> => {
  try {
    console.log("Starting PDF processing...");
    const fileArrayBuffer = await file.arrayBuffer();
    console.log("File loaded as ArrayBuffer");
    
    const pdf = await pdfjsLib.getDocument({ data: fileArrayBuffer }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    const results: QRCodeResult[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 }); // Increased scale for better QR detection
      
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

      console.log(`Page ${pageNum} rendered to canvas`);

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Find QR codes
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth' // Try both normal and inverted colors
      });

      if (qrCode) {
        console.log(`QR code found on page ${pageNum}: ${qrCode.data}`);
        
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
      } else {
        console.log(`No QR code found on page ${pageNum}`);
      }
    }

    console.log(`Processing complete. Found ${results.length} QR codes.`);
    return results;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};
