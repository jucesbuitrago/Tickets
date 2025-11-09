import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function FormInvitado() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit form:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Form */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-slate-900 mb-6">Agregar Invitado</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  />
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
                  />
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
                  />
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
                />
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
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Agregar
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
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
        </div>
      </div>
    </AppLayout>
  );
}