import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';

export default function FormInvitado() {
  const { post } = useApi();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setToastMessage('');

    try {
      const response = await post('/invitations', formData);
      console.log('Invitation created:', response.data);
      setToastMessage('Invitado agregado exitosamente');
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        documentType: 'CC',
        documentNumber: '',
        email: '',
        phone: '',
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Error al agregar invitado' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="grid grid-cols-12 gap-8">
        {/* Header */}
        <div className="col-span-12">
          <h1 className="text-4xl font-semibold text-slate-900">Agregar Invitado</h1>
        </div>
      {toastMessage && (
        <div
          className="col-span-12 rounded-2xl bg-green-50 border border-green-200 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-green-800">{toastMessage}</p>
        </div>
      )}
      <form className="col-span-12 xl:col-span-7 lg:col-span-12 rounded-2xl bg-white ring-1 ring-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Información del Invitado</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                required
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                required
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo Doc
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-[#D71920] focus:ring-[#D71920]/30 focus:outline-none"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número
              </label>
              <Input
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="12345678"
                required
                aria-invalid={!!errors.documentNumber}
              />
              {errors.documentNumber && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.documentNumber}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan.perez@email.com"
              required
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-12" variant="black" loading={isLoading}>
              {isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
            {errors.general && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.general}
              </p>
            )}
          </div>
        </div>
      </form>

      <aside className="col-span-12 xl:col-span-5 lg:col-span-12">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h2>

          <div className="space-y-4">
            <div>
              <span className="text-slate-600 block text-sm mb-1">Evento</span>
              <span className="font-medium">Ceremonia de Graduación 2024</span>
            </div>

            <div>
              <span className="text-slate-600 block text-sm mb-1">Fecha</span>
              <span className="font-medium">15 de Diciembre 2024</span>
            </div>

            <div>
              <span className="text-slate-600 block text-sm mb-1">Hora</span>
              <span className="font-medium">3:00 PM</span>
            </div>

            <div>
              <span className="text-slate-600 block text-sm mb-1">Lugar</span>
              <span className="font-medium">Teatro Principal</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sillas disponibles</span>
                <span className="font-medium text-green-600">245/300</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}