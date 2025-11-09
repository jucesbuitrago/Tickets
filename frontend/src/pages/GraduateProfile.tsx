import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import type { GraduateProfileResponse } from '../types/graduate';

const GraduateProfile = () => {
  const [profile, setProfile] = useState<{
    id: number;
    user_id: number;
    cupos_permitidos: number;
    cupos_usados: number;
    cupos_disponibles: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { get } = useApi();

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get<GraduateProfileResponse>('/graduate/me');
      const profileData = response.data.data;
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadProfile}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600">No se pudo cargar la información del perfil</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil de Graduando</h1>
        <Button onClick={loadProfile}>Actualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cupos Permitidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cupos Permitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {profile.cupos_permitidos}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total de cupos asignados
            </p>
          </CardContent>
        </Card>

        {/* Cupos Usados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cupos Usados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {profile.cupos_usados}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Invitaciones creadas
            </p>
          </CardContent>
        </Card>

        {/* Cupos Disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cupos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {profile.cupos_disponibles}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Pueden ser utilizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID de Graduando
              </label>
              <p className="mt-1 text-sm text-gray-900">{profile.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID de Usuario
              </label>
              <p className="mt-1 text-sm text-gray-900">{profile.user_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraduateProfile;