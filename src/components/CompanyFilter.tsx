import React from 'react';
import { Box, Autocomplete, TextField, Chip } from '@mui/material';
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
    <Box sx={{ mb: 3 }}>
      <Autocomplete
        multiple
        id="city-filter"
        options={cities}
        value={selectedCities}
        onChange={(_, newValue) => onCityChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('company.filter.selectCities')}
            placeholder={t('company.filter.searchCities')}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
      />
    </Box>
  );
};

export default CompanyFilter; 