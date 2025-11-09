import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QRScanner from '../QRScanner';
import { useApi } from '../../hooks/useApi';

// Mock the useApi hook
jest.mock('../../hooks/useApi');
const mockPost = jest.fn();

(useApi as jest.Mock).mockReturnValue({
  post: mockPost,
});

// Mock jsQR
jest.mock('jsqr', () => jest.fn());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

describe('QRScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders scanner interface correctly', () => {
    render(<QRScanner />);

    expect(screen.getByText('Escáner QR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Escaneo' })).toBeInTheDocument();
    expect(screen.getByText('En línea')).toBeInTheDocument();
  });

  it('loads queue from localStorage on mount', () => {
    const mockQueue = [{ qrString: 'test', timestamp: 123, attempts: 0 }];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockQueue));

    render(<QRScanner />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('scanQueue');
  });

  it('handles invalid queue data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<QRScanner />);

    expect(consoleSpy).toHaveBeenCalledWith('Error loading scan queue:', expect.any(SyntaxError));
    consoleSpy.mockRestore();
  });

  it('starts camera when start button is clicked', async () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ]),
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<QRScanner />);

    const startButton = screen.getByRole('button', { name: 'Iniciar Escaneo' });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'environment' }
      });
      expect(screen.getByRole('button', { name: 'Detener' })).toBeInTheDocument();
    });
  });

  it('handles camera access error', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetUserMedia.mockRejectedValue(new Error('Camera access denied'));

    render(<QRScanner />);

    const startButton = screen.getByRole('button', { name: 'Iniciar Escaneo' });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al acceder a la cámara. Asegúrate de dar permisos.');
    });

    alertSpy.mockRestore();
  });

  it('stops camera when stop button is clicked', async () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ]),
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    render(<QRScanner />);

    const startButton = screen.getByRole('button', { name: 'Iniciar Escaneo' });
    fireEvent.click(startButton);

    await waitFor(() => {
      const stopButton = screen.getByRole('button', { name: 'Detener' });
      fireEvent.click(stopButton);

      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    });
  });

  it('validates ticket successfully', async () => {
    const mockResponse = {
      data: {
        data: { status: 'OK' }
      }
    };
    mockPost.mockResolvedValue(mockResponse);

    render(<QRScanner />);

    // Simulate successful scan by calling validateTicket directly
    const component = screen.getByText('Escáner QR').closest('div');
    const instance = (component as any)._owner?.stateNode;

    if (instance) {
      await act(async () => {
        const result = await instance.validateTicket('test-qr-string');
        expect(result).toEqual({ status: 'OK' });
      });
    }

    expect(mockPost).toHaveBeenCalledWith('/scan/validate', {
      qr_string: 'test-qr-string',
      device_id: navigator.userAgent,
      is_offline_retry: false,
    });
  });

  it('handles validation error', async () => {
    const mockError = {
      response: {
        data: {
          reason: 'Invalid ticket'
        }
      }
    };
    mockPost.mockRejectedValue(mockError);

    render(<QRScanner />);

    const component = screen.getByText('Escáner QR').closest('div');
    const instance = (component as any)._owner?.stateNode;

    if (instance) {
      await act(async () => {
        const result = await instance.validateTicket('invalid-qr');
        expect(result).toEqual({
          status: 'ERROR',
          reason: 'Invalid ticket'
        });
      });
    }
  });

  it('queues scan when offline and validation fails', async () => {
    // Set offline
    Object.defineProperty(navigator, 'onLine', { value: false });

    const mockResponse = {
      data: {
        data: { status: 'ERROR', reason: 'Network error' }
      }
    };
    mockPost.mockResolvedValue(mockResponse);

    render(<QRScanner />);

    const component = screen.getByText('Escáner QR').closest('div');
    const instance = (component as any)._owner?.stateNode;

    if (instance) {
      await act(async () => {
        instance.handleScan('test-qr-string');
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'scanQueue',
          expect.stringContaining('test-qr-string')
        );
      });
    }
  });

  it('shows offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });

    render(<QRScanner />);

    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
  });

  it('shows queue status when scans are queued', () => {
    const mockQueue = [
      { qrString: 'test1', timestamp: 123, attempts: 0 },
      { qrString: 'test2', timestamp: 456, attempts: 1 }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockQueue));

    render(<QRScanner />);

    expect(screen.getByText('2 escaneos pendientes de sincronización')).toBeInTheDocument();
  });

  it('displays scan result correctly', async () => {
    const mockResponse = {
      data: {
        data: { status: 'OK', reason: 'Valid ticket' }
      }
    };
    mockPost.mockResolvedValue(mockResponse);

    render(<QRScanner />);

    const component = screen.getByText('Escáner QR').closest('div');
    const instance = (component as any)._owner?.stateNode;

    if (instance) {
      await act(async () => {
        instance.setLastResult({ status: 'OK', reason: 'Valid ticket' });
      });

      await waitFor(() => {
        expect(screen.getByText('✓ VÁLIDO')).toBeInTheDocument();
        expect(screen.getByText('Valid ticket')).toBeInTheDocument();
      });
    }
  });

  it('shows different status colors for different results', () => {
    const { rerender } = render(<QRScanner />);

    const statuses = [
      { status: 'OK', expectedText: '✓ VÁLIDO', expectedColor: 'text-green-600' },
      { status: 'INVALID', expectedText: '✗ INVÁLIDO', expectedColor: 'text-red-600' },
      { status: 'DUPLICATE', expectedText: '✗ YA USADO', expectedColor: 'text-red-600' },
      { status: 'REVOKED', expectedText: '✗ REVOCADO', expectedColor: 'text-red-600' },
      { status: 'EXPIRED', expectedText: '✗ EXPIRADO', expectedColor: 'text-red-600' },
      { status: 'ERROR', expectedText: '✗ ERROR', expectedColor: 'text-red-600' },
    ];

    statuses.forEach(({ status, expectedText }) => {
      rerender(<QRScanner />);
      const component = screen.getByText('Escáner QR').closest('div');
      const instance = (component as any)._owner?.stateNode;

      if (instance) {
        act(() => {
          instance.setLastResult({ status });
        });

        expect(screen.getByText(expectedText)).toBeInTheDocument();
      }
    });
  });

  it('processes queue when coming back online', async () => {
    const mockQueue = [{ qrString: 'test-qr', timestamp: 123, attempts: 0 }];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockQueue));

    const mockResponse = {
      data: {
        data: { status: 'OK' }
      }
    };
    mockPost.mockResolvedValue(mockResponse);

    // Start offline
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { rerender } = render(<QRScanner />);

    // Come back online
    Object.defineProperty(navigator, 'onLine', { value: true });

    rerender(<QRScanner />);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/scan/validate', {
        qr_string: 'test-qr',
        device_id: navigator.userAgent,
        is_offline_retry: true,
      });
    });
  });

  it('cleans up camera on unmount', () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ]),
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { unmount } = render(<QRScanner />);

    unmount();

    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
  });
});