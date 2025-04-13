import { Box, Typography, TextField, Button, Container } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/companies?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Container >
      <Box sx={{ textAlign: 'center', my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Expat
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Find companies and job opportunities in Finland
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mt: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ minWidth: 200 }}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 