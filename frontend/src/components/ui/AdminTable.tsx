import React from 'react';
import { cn } from '../../lib/utils';
import { AdminButton } from './AdminButton';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onSelectAll?: (selected: boolean) => void;
  onSelectRow?: (id: string | number, selected: boolean) => void;
  selectedRows?: (string | number)[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange?: (page: number) => void;
}

export function AdminTable({
  columns,
  data,
  loading = false,
  onSelectAll,
  onSelectRow,
  selectedRows = [],
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: AdminTableProps) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-slate-200">
            <tr>
              {onSelectAll && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-slate-900"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0) + ((onEdit || onDelete) ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0) + ((onEdit || onDelete) ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-slate-50">
                  {onSelectRow && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => onSelectRow(row.id, e.target.checked)}
                        className="rounded border-slate-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-slate-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-700">
            Mostrando {pagination.from}–{pagination.to} de {pagination.total}
          </p>
          <div className="flex space-x-2">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <AdminButton
                key={page}
                variant={page === pagination.current_page ? 'primary' : 'danger'}
                onClick={() => onPageChange?.(page)}
                className="px-3 py-1 text-xs"
              >
                {page}
              </AdminButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}