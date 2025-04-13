import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Container,
  Pagination,
} from '@mui/material';

interface Company {
  businessId: string;
  name: string;
  street: string;
  postCode: string;
  city: string;
  mainBusinessLine: string;
}

const Companies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/companies?search=${searchQuery}`);
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedCompanies = companies.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Companies
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Search
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {paginatedCompanies.map((company) => (
                <Card key={company.businessId} sx={{ flex: '1 1 300px', maxWidth: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {company.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {company.street}
                    </Typography>
                    <Typography color="text.secondary">
                      {company.postCode} {company.city}
                    </Typography>
                    <Typography variant="body2">
                      Business Line: {company.mainBusinessLine}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" href={`/companies/${company.businessId}`}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(companies.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Companies; 