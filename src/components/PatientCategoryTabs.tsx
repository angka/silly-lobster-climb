import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PatientCategoryTabsProps {
  currentCategory: 'All' | 'RGP' | 'Scleral lens';
  onCategoryChange: (category: 'All' | 'RGP' | 'Scleral lens') => void;
}

const PatientCategoryTabs: React.FC<PatientCategoryTabsProps> = ({ currentCategory, onCategoryChange }) => {
  return (
    <Tabs value={currentCategory} onValueChange={(value) => onCategoryChange(value as 'All' | 'RGP' | 'Scleral lens')} className="w-full">
      <TabsList className="grid w-full grid-cols-1 h-auto p-1 gap-1">
        <TabsTrigger value="All" className="justify-start">All Patients</TabsTrigger>
        <TabsTrigger value="RGP" className="justify-start">RGP</TabsTrigger>
        <TabsTrigger value="Scleral lens" className="justify-start">Scleral Lens</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default PatientCategoryTabs;