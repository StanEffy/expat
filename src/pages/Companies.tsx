import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { COMPANY_ENDPOINTS } from "../constants/api";
import { getAuthHeaders } from "../utils/auth";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";

interface Company {
  id: number;
  name: string;
  description: string;
  mainbusinessline: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const Companies = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1");
    const initialItemsPerPage = parseInt(searchParams.get("limit") || "10");

    setPage(initialPage);
    setItemsPerPage(initialItemsPerPage);

    fetchCompanies(initialPage, initialItemsPerPage, false);
  }, []);

  const fetchCompanies = async (
    pageNumber: number,
    limit: number,
    append: boolean = false
  ) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        return;
      }

      const response = await fetch(COMPANY_ENDPOINTS.LIST(pageNumber, limit), {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch companies");
      }

      const { data } = await response.json();

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setCompanies((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === limit);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching companies";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (page === 1 && itemsPerPage === 10) return;

    setLoading(true);
    fetchCompanies(1, itemsPerPage, false);
    setPage(1);
  }, [itemsPerPage]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchCompanies(nextPage, itemsPerPage, true);

    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", nextPage.toString());
    newSearchParams.set("limit", itemsPerPage.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent) => {
    const newValue = parseInt(event.target.value);
    setItemsPerPage(newValue);

    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    newSearchParams.set("limit", newValue.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          {t("common.tryAgain")}
        </Button>
      </Container>
    );
  }

  if (companies.length === 0) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>{t("common.noCompanies")}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="items-per-page-label">
            {t("common.itemsPerPage")}
          </InputLabel>
          <Select
            labelId="items-per-page-label"
            value={itemsPerPage.toString()}
            label={t("common.itemsPerPage")}
            onChange={handleItemsPerPageChange}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mt: 2,
        }}
      >
        {companies.map((company) => (
          <Card
            key={company.id}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: "bold" }}
                component="h3"
              >
                {company.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {company.mainbusinessline}
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                {t("common.viewDetails")}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <CircularProgress size={24} />
            ) : (
              t("common.showMore")
            )}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Companies;
