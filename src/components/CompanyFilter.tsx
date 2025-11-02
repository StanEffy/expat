import React from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useTranslation } from 'react-i18next';
import styles from './CompanyFilter.module.scss';

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
    <div className={styles.container}>
      <AutoComplete
        multiple
        value={selectedCities}
        suggestions={cities}
        completeMethod={() => {}}
        onChange={(e) => onCityChange(e.value)}
        placeholder={t('company.filter.selectCities')}
        className={styles.autocomplete}
      />
    </div>
  );
};

export default CompanyFilter; 