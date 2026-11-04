import React from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useTranslation } from 'react-i18next';
import type { CityOption } from '@/types';
import styles from './CompanyFilter.module.scss';

interface CompanyFilterProps {
  cities: CityOption[];
  selectedCities: string[];
  onCityChange: (cities: string[]) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({
  cities,
  selectedCities,
  onCityChange,
}) => {
  const { t, i18n } = useTranslation();
  const [filteredCities, setFilteredCities] = React.useState<string[]>([]);

  const byName = React.useMemo(() => new Map(cities.map((c) => [c.name, c])), [cities]);

  // Cities come biggest first, so an empty query offers Helsinki, Espoo, Vantaa…
  // Swedish names match too: typing "Esbo" finds Espoo.
  const searchCities = (event: { query: string }) => {
    const query = event.query.trim().toLowerCase();
    const filtered = cities
      .filter((city) => !selectedCities.includes(city.name))
      .filter(
        (city) =>
          !query ||
          city.name.toLowerCase().includes(query) ||
          (city.nameSv ?? '').toLowerCase().includes(query),
      )
      .slice(0, 30)
      .map((city) => city.name);
    setFilteredCities(filtered);
  };

  const itemTemplate = (name: string) => {
    const city = byName.get(name);
    const showSv = city?.nameSv && city.nameSv !== city.name;
    return (
      <span className={styles.option}>
        <span>
          {name}
          {showSv && <span className={styles.optionAlt}> / {city?.nameSv}</span>}
        </span>
        {city && city.count > 0 && (
          <span className={styles.optionCount}>
            {city.count.toLocaleString(i18n.language)}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <AutoComplete
        multiple
        dropdown
        value={selectedCities}
        suggestions={filteredCities}
        completeMethod={searchCities}
        itemTemplate={itemTemplate}
        onChange={(e) => onCityChange(e.value)}
        placeholder={t('company.filter.selectCities')}
        className={styles.autocomplete}
        appendTo="self"
      />
    </div>
  );
};

export default CompanyFilter;
