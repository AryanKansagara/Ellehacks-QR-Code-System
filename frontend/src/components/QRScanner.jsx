import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    fetchScanHistory();
    const createScanner = () => {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      setScanner(html5QrcodeScanner);
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    };

    createScanner();

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/qrcodes');
      const data = await response.json();
      setScanHistory(data);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      const response = await fetch('http://localhost:5000/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeValue: decodedText }),
      });
      
      const data = await response.json();
      setScanResult(decodedText);
      setIsExisting(data.exists);
      fetchScanHistory();
      
      if (scanner) {
        scanner.pause();
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  };

  const onScanFailure = (error) => {
    console.warn(`QR code scan failed: ${error}`);
  };

  const handleReset = () => {
    setScanResult(null);
    setIsExisting(false);
    if (scanner) {
      scanner.resume();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-center">QR Code Scanner</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {!scanResult ? (
              <div id="qr-reader" className="mb-4" />
            ) : (
              <div className={`mb-4 p-4 rounded ${isExisting ? 'bg-red-100' : 'bg-green-100'}`}>
                <p className="font-medium">Scanned Result:</p>
                <p className="break-all">{scanResult}</p>
                <p className="mt-2 font-medium">
                  {isExisting ? 'Already scanned before!' : 'New QR code - Saved to database'}
                </p>
              </div>
            )}
            
            {scanResult && (
              <button
                onClick={handleReset}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Scan Another Code
              </button>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Scan History</h3>
            <div className="max-h-96 overflow-y-auto">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="mb-2 p-3 bg-gray-50 rounded">
                  <p className="break-all">{scan.code_value}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(scan.scan_date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;