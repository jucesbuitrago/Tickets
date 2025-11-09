import React, { useState, useEffect } from 'react';
import { AdminCard } from '../components/ui/AdminCard';
import { AdminTable } from '../components/ui/AdminTable';
import { AdminBadge } from '../components/ui/AdminBadge';
import { ActionBar } from '../components/ui/ActionBar';
import { EmptyDnD } from '../components/ui/EmptyDnD';
import { useApi } from '../hooks/useApi';

interface Graduate {
  id: number;
  first_name: string;
  last_name: string;
  program: string;
  phone: string;
  academic_email: string;
  code: string;
  status: 'active' | 'inactive';
}

const CargueGraduados: React.FC = () => {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { get, post, delete: del } = useApi();

  const columns = [
    { key: 'first_name', header: 'Nombre Estudiante' },
    { key: 'last_name', header: 'Apellido Estudiante' },
    { key: 'program', header: 'Programa' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'academic_email', header: 'Correo Académico' },
    { key: 'code', header: 'Código' },
    {
      key: 'status',
      header: 'Estado',
      render: (value: string) => (
        <AdminBadge variant={value === 'active' ? 'active' : 'inactive'} />
      ),
    },
  ];

  useEffect(() => {
    loadGraduates();
  }, []);

  const loadGraduates = async () => {
    setLoading(true);
    try {
      const response = await get('/admin/graduates');
      setGraduates((response.data as any).graduates || []);
    } catch (error) {
      console.error('Error loading graduates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await post('/admin/graduates/import', formData);
      loadGraduates();
    } catch (error) {
      console.error('Error importing graduates:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      await Promise.all(selectedRows.map(id => del(`/admin/graduates/${id}`)));
      setSelectedRows([]);
      loadGraduates();
    } catch (error) {
      console.error('Error deleting graduates:', error);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? graduates.map(g => g.id) : []);
  };

  const handleSelectRow = (id: string | number, selected: boolean) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    setSelectedRows(prev =>
      selected
        ? [...prev, numId]
        : prev.filter(rowId => rowId !== numId)
    );
  };

  const handleExport = () => {
    // Implement CSV/XLSX export
    console.log('Export functionality to be implemented');
  };

  const handleFilter = () => {
    // Implement filter popover
    console.log('Filter functionality to be implemented');
  };

  const handleAdd = () => {
    // Implement add modal/form
    console.log('Add functionality to be implemented');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black h-14 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">UT</span>
          </div>
          <h1 className="text-white font-semibold">Universidad del Tolima</h1>
        </div>
        <button className="text-white hover:text-gray-300 transition-colors">
          Salir
        </button>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 w-16 bg-black h-[calc(100vh-3.5rem)] flex flex-col items-center py-6 space-y-6">
        {/* Navigation items would go here */}
      </aside>

      {/* Main Content */}
      <main className="ml-16 mt-14">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Cargue Graduados</h1>
              <p className="text-slate-400">A descriptive body text comes here</p>
            </div>

            <ActionBar
              onDelete={selectedRows.length > 0 ? handleDelete : undefined}
              onFilter={handleFilter}
              onExport={handleExport}
              onAdd={handleAdd}
              selectedCount={selectedRows.length}
            />

            {graduates.length === 0 && !loading ? (
              <EmptyDnD onFileSelect={handleFileSelect} />
            ) : (
              <AdminCard>
                <AdminTable
                  columns={columns}
                  data={graduates}
                  loading={loading}
                  onSelectAll={handleSelectAll}
                  onSelectRow={handleSelectRow}
                  selectedRows={selectedRows}
                  onEdit={(row) => console.log('Edit:', row)}
                  onDelete={(row) => del(`/admin/graduates/${row.id}`).then(loadGraduates)}
                />
              </AdminCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CargueGraduados;