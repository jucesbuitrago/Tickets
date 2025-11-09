import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { useApi } from '../hooks/useApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ScanResult {
  status: 'OK' | 'INVALID' | 'DUPLICATE' | 'REVOKED' | 'EXPIRED' | 'ERROR';
  reason?: string;
}

interface QueuedScan {
  qrString: string;
  timestamp: number;
  attempts: number;
}

const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedScan[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { post } = useApi();

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('scanQueue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error('Error loading scan queue:', e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scanQueue', JSON.stringify(queue));
  }, [queue]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process offline queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue.length, isProcessing]);

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);

    const newQueue = [...queue];
    let processedCount = 0;

    for (let i = 0; i < newQueue.length; i++) {
      const scan = newQueue[i];
      if (scan.attempts >= 3) continue; // Skip if max attempts reached

      try {
        const result = await validateTicket(scan.qrString, true);
        if (result.status === 'OK' || result.status === 'DUPLICATE') {
          // Remove from queue on success or if already used
          newQueue.splice(i, 1);
          i--; // Adjust index after removal
          processedCount++;
        } else {
          // Increment attempts on failure
          scan.attempts++;
        }
      } catch (error) {
        console.error('Error processing queued scan:', error);
        scan.attempts++;
      }
    }

    setQueue(newQueue);
    setIsProcessing(false);

    if (processedCount > 0) {
      setLastResult({
        status: 'OK',
        reason: `Procesados ${processedCount} escaneos pendientes`
      });
    }
  }, [queue, isProcessing]);

  const validateTicket = async (qrString: string, isOfflineRetry = false): Promise<ScanResult> => {
    try {
      const response = await post<ScanResult>('/scan/validate', {
        qr_string: qrString,
        device_id: navigator.userAgent,
        is_offline_retry: isOfflineRetry,
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error validating ticket:', error);
      return {
        status: 'ERROR',
        reason: error.response?.data?.reason || 'Error de conexión'
      };
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        scanQR();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error al acceder a la cámara. Asegúrate de dar permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsScanning(false);
  };

  const scanQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleScan(code.data);
        return; // Stop scanning after successful scan
      }
    }

    animationRef.current = requestAnimationFrame(scanQR);
  }, [isScanning]);

  const handleScan = async (qrString: string) => {
    stopCamera();

    const result = await validateTicket(qrString);

    if (!isOnline && result.status !== 'OK') {
      // Queue for later if offline and not successful
      const newQueue = [...queue, {
        qrString,
        timestamp: Date.now(),
        attempts: 0
      }];
      setQueue(newQueue);
      setLastResult({
        status: 'OK',
        reason: 'Escaneo guardado para sincronización posterior'
      });
    } else {
      setLastResult(result);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600';
      case 'INVALID':
      case 'DUPLICATE':
      case 'REVOKED':
      case 'EXPIRED':
      case 'ERROR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'OK': return '✓ VÁLIDO';
      case 'INVALID': return '✗ INVÁLIDO';
      case 'DUPLICATE': return '✗ YA USADO';
      case 'REVOKED': return '✗ REVOCADO';
      case 'EXPIRED': return '✗ EXPIRADO';
      case 'ERROR': return '✗ ERROR';
      default: return status;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Escáner QR</h1>

          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg border"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2 mt-4">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex-1">
                Iniciar Escaneo
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Detener
              </Button>
            )}
          </div>

          <div className="mt-4 text-sm text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              {isOnline ? 'En línea' : 'Sin conexión'}
            </div>
          </div>

          {queue.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {queue.length} escaneo{queue.length > 1 ? 's' : ''} pendiente{queue.length > 1 ? 's' : ''} de sincronización
              </p>
              {isProcessing && (
                <p className="text-xs text-yellow-600 mt-1">Procesando...</p>
              )}
            </div>
          )}
        </Card>

        {lastResult && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Resultado del Escaneo</h2>
            <div className={`text-center text-xl font-bold ${getStatusColor(lastResult.status)}`}>
              {getStatusMessage(lastResult.status)}
            </div>
            {lastResult.reason && (
              <p className="text-center text-gray-600 mt-2">{lastResult.reason}</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRScanner;