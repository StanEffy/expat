import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCategories } from "../contexts/CategoriesContext";

const Categories = () => {
  const { t } = useTranslation();
  const { categories, loading, error, fetchCategories } = useCategories();

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
          onClick={() => fetchCategories()}
          sx={{ mt: 2 }}
        >
          {t("common.tryAgain")}
        </Button>
      </Container>
    );
  }

  if (categories.length === 0) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>{t("common.noCategories")}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ mt: 4, mb: 4 }}>
        {t("categories.title")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {categories.map((category) => (
          <Card
            key={category.id}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: "bold" }}
                component="h3"
              >
                {category.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                ID: {category.mainbusinessline}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Categories;
