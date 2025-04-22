import { useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CompanyFilterProps {
  cities: string[];
  selectedCities: string[];
  onCityChange: (cities: string[]) => void;
}

const CompanyFilter = ({ cities, selectedCities, onCityChange }: CompanyFilterProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('company.filter.title')}
      </Typography>
      <Autocomplete
        multiple
        options={filteredCities}
        value={selectedCities}
        onChange={(_, newValue) => onCityChange(newValue)}
        onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('company.filter.searchCities')}
            placeholder={t('company.filter.selectCities')}
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