import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Users
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}