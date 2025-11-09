import React from 'react';
import { AdminButton } from './AdminButton';
import { Filter, Download } from 'lucide-react';

interface ActionBarProps {
  onDelete?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  selectedCount?: number;
}

export function ActionBar({
  onDelete,
  onFilter,
  onExport,
  onAdd,
  selectedCount = 0,
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {onDelete && selectedCount > 0 && (
          <AdminButton variant="danger" onClick={onDelete}>
            Eliminar ({selectedCount})
          </AdminButton>
        )}
        {onFilter && (
          <AdminButton variant="danger" onClick={onFilter}>
            <Filter className="w-4 h-4 mr-2" />
            Filtro
          </AdminButton>
        )}
        {onExport && (
          <AdminButton variant="danger" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </AdminButton>
        )}
      </div>
      {onAdd && (
        <AdminButton onClick={onAdd}>
          + Agregar
        </AdminButton>
      )}
    </div>
  );
}