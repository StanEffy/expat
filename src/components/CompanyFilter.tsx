import React from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useTranslation } from 'react-i18next';

interface CompanyFilterProps {
  cities: string[];
  selectedCities: string[];
  onCityChange: (cities: string[]) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({
  cities,
  selectedCities,
  onCityChange,
}) => {
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: '24px' }}>
      <AutoComplete
        multiple
        value={selectedCities}
        suggestions={cities}
        completeMethod={() => {}}
        onChange={(e) => onCityChange(e.value)}
        placeholder={t('company.filter.selectCities')}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default CompanyFilter; 