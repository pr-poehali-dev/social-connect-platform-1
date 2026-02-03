import { useState, useEffect, useRef } from 'react';

export interface DatingFilters {
  gender: string;
  ageFrom: string;
  ageTo: string;
  city: string;
  online: boolean;
  withPhoto: boolean;
  district: string;
  heightFrom: string;
  heightTo: string;
  bodyType: string;
  maritalStatus: string;
  hasChildren: string;
  financialStatus: string;
  hasCar: string;
  hasHousing: string;
  datingGoal: string;
}

interface UseDatingFiltersProps {
  onFiltersChange: () => void;
}

export const useDatingFilters = ({ onFiltersChange }: UseDatingFiltersProps) => {
  const [filters, setFilters] = useState<DatingFilters>({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
    online: false,
    withPhoto: true,
    district: '',
    heightFrom: '',
    heightTo: '',
    bodyType: '',
    maritalStatus: '',
    hasChildren: '',
    financialStatus: '',
    hasCar: '',
    hasHousing: '',
    datingGoal: '',
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      ageFrom: '',
      ageTo: '',
      city: '',
      online: false,
      withPhoto: false,
      district: '',
      heightFrom: '',
      heightTo: '',
      bodyType: '',
      maritalStatus: '',
      hasChildren: '',
      financialStatus: '',
      hasCar: '',
      hasHousing: '',
      datingGoal: '',
    });
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onFiltersChange();
    }, 800);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    filters,
    handleFilterChange,
    resetFilters
  };
};
