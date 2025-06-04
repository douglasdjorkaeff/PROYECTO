import React, { useEffect } from 'react';

const BarcodeScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    let scannerInstance;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scannerInstance = new Html5QrcodeScanner('scanner', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: ['QR_CODE', 'EAN_13', 'CODE_128', 'UPC_A', 'EAN_8', 'CODE_39']
      });

      scannerInstance.render(
        (decodedText) => {
          scannerInstance.clear();
          onScanSuccess(decodedText);
        },
        (error) => {
          // Silenciar errores menores
        }
      );
    });

    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return <div id="scanner" />;
};

export default BarcodeScanner;
