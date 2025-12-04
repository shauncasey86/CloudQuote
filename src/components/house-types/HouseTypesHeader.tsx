'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

interface HouseTypesHeaderProps {
  onAddHouseType: () => void;
}

export function HouseTypesHeader({ onAddHouseType }: HouseTypesHeaderProps) {
  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient-nebula mb-2">
            House Types
          </h1>
          <p className="text-text-secondary text-base">
            Manage house types and their allowance amounts
          </p>
        </div>
        <Button variant="primary" onClick={onAddHouseType}>
          <Home className="w-4 h-4 mr-2" />
          Add House Type
        </Button>
      </div>
    </div>
  );
}
