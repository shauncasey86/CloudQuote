'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HouseTypesHeader, HouseTypesTable, HouseTypeFormModal, HouseTypeFormData } from '@/components/house-types';
import { Role } from '@prisma/client';
import { toast } from 'sonner';

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

export default function HouseTypesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [houseTypes, setHouseTypes] = React.useState<HouseType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingHouseType, setEditingHouseType] = React.useState<HouseType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Check if user is admin
  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== Role.ADMIN) {
      router.push('/settings');
      return;
    }
  }, [session, status, router]);

  // Fetch house types
  const fetchHouseTypes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/house-types?active=false');

      if (!response.ok) {
        throw new Error('Failed to fetch house types');
      }

      const data = await response.json();
      setHouseTypes(data.data);
    } catch (error) {
      console.error('Error fetching house types:', error);
      toast.error('Failed to load house types');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user.role === Role.ADMIN) {
      fetchHouseTypes();
    }
  }, [session, fetchHouseTypes]);

  const handleAddHouseType = () => {
    setEditingHouseType(null);
    setIsModalOpen(true);
  };

  const handleEditHouseType = (houseType: HouseType) => {
    setEditingHouseType(houseType);
    setIsModalOpen(true);
  };

  const handleDeleteHouseType = async (houseType: HouseType) => {
    try {
      const response = await fetch(`/api/house-types/${houseType.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete house type');
      }

      const result = await response.json();
      if (result.deactivated) {
        toast.success(`House type "${houseType.name}" deactivated (has existing quotes)`);
      } else {
        toast.success(`House type "${houseType.name}" deleted successfully`);
      }
      fetchHouseTypes();
    } catch (error: any) {
      console.error('Error deleting house type:', error);
      toast.error(error.message || 'Failed to delete house type');
    }
  };

  const handleSubmit = async (data: HouseTypeFormData) => {
    try {
      setIsSubmitting(true);

      const url = editingHouseType ? `/api/house-types/${editingHouseType.id}` : '/api/house-types';
      const method = editingHouseType ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save house type');
      }

      toast.success(
        editingHouseType
          ? `House type "${data.name}" updated successfully`
          : `House type "${data.name}" created successfully`
      );

      setIsModalOpen(false);
      fetchHouseTypes();
    } catch (error: any) {
      console.error('Error saving house type:', error);
      toast.error(error.message || 'Failed to save house type');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      // Optimistically update the UI
      const reordered = orderedIds.map((id, index) => {
        const ht = houseTypes.find(h => h.id === id);
        return ht ? { ...ht, sortOrder: index } : null;
      }).filter((ht): ht is HouseType => ht !== null);
      setHouseTypes(reordered);

      // Update all sort orders in the database
      await Promise.all(
        orderedIds.map((id, index) =>
          fetch(`/api/house-types/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: index }),
          })
        )
      );

      toast.success('House types reordered');
    } catch (error) {
      console.error('Error reordering house types:', error);
      toast.error('Failed to reorder house types');
      fetchHouseTypes(); // Revert to original order
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-glass rounded-xl w-64 mb-2"></div>
          <div className="h-5 bg-glass rounded-xl w-96"></div>
        </div>
        <div className="glass-card p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-glass rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="space-y-6">
      <HouseTypesHeader onAddHouseType={handleAddHouseType} />

      <div className="animate-fadeUp-delay-1">
        <HouseTypesTable
          houseTypes={houseTypes}
          onEdit={handleEditHouseType}
          onDelete={handleDeleteHouseType}
          onReorder={handleReorder}
        />
      </div>

      <HouseTypeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        houseType={editingHouseType}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
