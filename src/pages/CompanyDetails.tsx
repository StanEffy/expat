import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Button,
} from '@mui/material';

interface CompanyDetails {
  businessId: string;
  name: string;
  street: string;
  postCode: string;
  city: string;
  buildingNumber: string;
  apartmentNumber: string;
  mainBusinessLine: string;
  website: string;
}

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/companies/${id}`);
        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error('Error fetching company details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!company) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Company not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {company.name}
        </Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            <Typography>
              <strong>Business ID:</strong> {company.businessId}
            </Typography>
            <Typography>
              <strong>Address:</strong> {company.street} {company.buildingNumber}
              {company.apartmentNumber && `, ${company.apartmentNumber}`}
            </Typography>
            <Typography>
              <strong>Postal Code:</strong> {company.postCode}
            </Typography>
            <Typography>
              <strong>City:</strong> {company.city}
            </Typography>
            <Typography>
              <strong>Main Business Line:</strong> {company.mainBusinessLine}
            </Typography>
            {company.website && (
              <Typography>
                <strong>Website:</strong>{' '}
                <Button
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </Button>
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CompanyDetails; 