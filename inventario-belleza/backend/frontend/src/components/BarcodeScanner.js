import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner('scanner', {
      fps: 10,
      qrbox: { width: 850, height: 720 },
      formatsToSupport: ['EAN_13', 'CODE_128', 'UPC_A']
    });

    scannerRef.current.render(
      (decodedText) => {
        scannerRef.current.clear().then(() => {
          onScanSuccess(decodedText);
        }).catch(console.error);
      },
      (error) => {
        // Errores silenciosos
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []); // Solo montar/desmontar una vez

  return <div id="scanner" />;
};

export default BarcodeScanner;
