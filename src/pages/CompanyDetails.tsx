import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
} from '@mui/material';
import { COMPANY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

interface CompanyDetails {
  id: number;
  businessid: string;
  name: string;
  mainbusinessline: string;
  website: string;
  street: string;
  postcode: string;
  city: string;
  buildingnumber: string;
  apartmentnumber: string | null;
  company_description: string | null;
  recruitment_page: string | null;
  industry: string;
  size: string;
  founded: string;
  country: string;
}

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!id) return;

      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          return;
        }

        const response = await fetch(COMPANY_ENDPOINTS.DETAILS(id), {
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch company details');
        }

        const data = await response.json();
        
        if (data.length > 0) {
          setCompany(data[0]);
        } else {
          setError('Company not found');
          showNotification('Company not found', 'error');
        }
      
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching company details';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id, showNotification]);

  const getGoogleMapsUrl = (company: CompanyDetails) => {
    const address = `${company.street} ${company.buildingnumber}${company.apartmentnumber ? `, ${company.apartmentnumber}` : ''}, ${company.postcode} ${company.city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>
          Company not found.
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
        <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'left' }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('company.information')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>{t('company.businessId')}:</strong> {company.businessid}
                  </Typography>
                  <Typography>
                    <strong>{t('company.mainBusinessLine')}:</strong> {company.mainbusinessline}
                  </Typography>
                  {company.website && (
                    <Typography>
                      <strong>{t('company.website')}:</strong>{' '}
                      <Link href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
                        {company.website}
                      </Link>
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} >
            {company.street && company.city ? (
              <Link
                href={getGoogleMapsUrl(company)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <Card sx={{ 
                position: 'relative',
                overflow: 'hidden',               
                width: '100%',
                minWidth: 350,
                mx: 'auto',
                "&:hover": {
                  boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.2)"
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("../src/assets/map_bg.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: '50%',
                  bottom: 0,
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                  backdropFilter: 'blur(8px)',
                  zIndex: 1,
                }
              }}>
                <CardContent sx={{ 
                  position: 'relative', 
                  zIndex: 2,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                    <Typography variant="h6" gutterBottom>
                      {t('company.address')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography>
                        {company.street} {company.buildingnumber}
                        {company.apartmentnumber && `, ${company.apartmentnumber}`}
                      </Typography>
                      <Typography>
                        {company.postcode} {company.city}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card sx={{ 
                position: 'relative',
                overflow: 'hidden',
                maxWidth: 600,
                width: '100%',
                mx: 'auto',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("../src/assets/map_bg.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: '50%',
                  bottom: 0,
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1,
                }
              }}>
                <CardContent sx={{ 
                  position: 'relative', 
                  zIndex: 2,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" gutterBottom>
                    {t('company.address')}
                  </Typography>
                  <Typography color="textSecondary">
                    {t('company.noAddress')}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          {company.company_description && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('company.description')}
                  </Typography>
                  <Typography>
                    {company.company_description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {company.recruitment_page && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('company.recruitment')}
                  </Typography>
                  <Typography>
                    <Link href={company.recruitment_page} target="_blank" rel="noopener noreferrer">
                      {t('company.visitRecruitmentPage')}
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default CompanyDetails; 