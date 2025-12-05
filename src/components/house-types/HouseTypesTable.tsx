'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Home, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

interface HouseType {
  id: string;
  name: string;
  allowance: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  _count?: {
    quotes: number;
  };
}

interface HouseTypesTableProps {
  houseTypes: HouseType[];
  onEdit: (houseType: HouseType) => void;
  onDelete: (houseType: HouseType) => void;
  onReorder?: (orderedIds: string[]) => void;
}

export function HouseTypesTable({ houseTypes, onEdit, onDelete, onReorder }: HouseTypesTableProps) {
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<string[]>([]);

  // Initialize order when house types change
  React.useEffect(() => {
    setOrder(houseTypes.map(ht => ht.id));
  }, [houseTypes]);

  const handleDeleteClick = (houseType: HouseType) => {
    if (deleteConfirm === houseType.id) {
      onDelete(houseType);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(houseType.id);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newOrder = [...order];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    setOrder(newOrder);
  };

  const handleDragEnd = () => {
    if (draggedId && onReorder) {
      onReorder(order);
    }
    setDraggedId(null);
  };

  // Sort house types by drag order
  const orderedHouseTypes = [...houseTypes].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
  );

  if (houseTypes.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-glass rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No house types found
          </h3>
          <p className="text-text-secondary">
            Get started by adding your first house type
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass">
              <th className="w-8 px-2 py-2"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Allowance
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Quotes
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Created
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            {orderedHouseTypes.map((houseType) => (
              <tr
                key={houseType.id}
                className={`hover:bg-glass/50 transition-colors group ${
                  draggedId === houseType.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, houseType.id)}
                onDragOver={(e) => handleDragOver(e, houseType.id)}
                onDragEnd={handleDragEnd}
              >
                <td className="px-2 py-2 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    <span className="font-medium text-text-primary text-sm">{houseType.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="font-mono text-sm text-text-primary">
                    £{Number(houseType.allowance).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-text-secondary text-sm">{houseType._count?.quotes ?? 0}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs font-medium ${houseType.active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {houseType.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-text-secondary text-xs">
                    {format(new Date(houseType.createdAt), 'dd MMM yyyy')}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(houseType)}
                      title="Edit house type"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={deleteConfirm === houseType.id ? 'danger' : 'ghost'}
                      size="icon"
                      onClick={() => handleDeleteClick(houseType)}
                      title={
                        deleteConfirm === houseType.id
                          ? 'Click again to confirm'
                          : houseType._count?.quotes
                          ? 'Deactivate house type'
                          : 'Delete house type'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
