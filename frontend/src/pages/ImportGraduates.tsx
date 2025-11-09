import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import type { ImportGraduatesResponse } from '../types/admin';

const ImportGraduates = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportGraduatesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { post } = useApi();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await post<ImportGraduatesResponse>('/admin/import-graduates', formData);
      setUploadResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">Importar Graduandos</h1>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl lg:text-3xl">Subir Archivo Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo Excel aquí'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    O haz clic para seleccionar un archivo (.xls, .xlsx, .csv)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Input
                type="file"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-6"
              >
                {isUploading ? 'Subiendo...' : 'Subir Archivo'}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {uploadResult && (
              <div className={`p-4 border rounded-md ${
                uploadResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`font-medium ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.message}
                </p>

                {uploadResult.data && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <strong>Importados:</strong> {uploadResult.data.imported}
                    </p>

                    {uploadResult.data.errors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-800">Errores:</p>
                        <ul className="text-sm text-red-700 mt-1 space-y-1">
                          {uploadResult.data.errors.map((error, index) => (
                            <li key={index}>
                              {error.row && `Fila ${error.row}: `}{error.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {uploadResult.errors && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-800">Errores de validación:</p>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {Object.entries(uploadResult.errors).map(([field, messages]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {messages.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>El archivo Excel debe contener las siguientes columnas:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Columna 0:</strong> user_id (número entero positivo)</li>
                <li><strong>Columna 1:</strong> cupos_permitidos (número entero no negativo)</li>
              </ul>
              <p className="mt-4">
                La primera fila se considera el encabezado y será ignorada durante la importación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportGraduates;