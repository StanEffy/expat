import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "primereact/card";
import Button from "../components/Common/Button";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { companyService } from "@/services/companyService";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import CompanyFilter from "../components/Companies/CompanyFilter";
import CategoryFilter from "../components/Companies/CategoryFilter";
import FavouriteButton from "../components/Common/FavouriteButton";
import SEO from "../components/Common/SEO";
import type { Company, BackendCategoryItem, GeneralCategoryItem } from "@/types";
import styles from "./Companies.module.scss";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const formatDate = (value?: string | null): string | null => {
  if (!value) return null;
  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch {
    return null;
  }
};

const Companies = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [categories, setCategories] = useState<BackendCategoryItem[]>([]);
  const [generalCategories, setGeneralCategories] = useState<GeneralCategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const previousCountRef = useRef(0);

  const fetchCompanies = useCallback(
    async ({
      pageNumber,
      limit,
      append = false,
      mainbusinesslineid,
      cities: filterCities,
    }: {
      pageNumber: number;
      limit: number;
      append?: boolean;
      mainbusinesslineid?: string;
      cities?: string[];
    }) => {
      try {
        const data = await companyService.getCompanies({
          page: pageNumber,
          count: limit,
          mainbusinesslineid,
          cities: filterCities,
        });

        if (append) {
          if (data.length) {
            setCompanies((prev) => {
              previousCountRef.current = prev.length;
              return [...prev, ...data];
            });
          }
        } else {
          previousCountRef.current = 0;
          setCompanies(data);
        }

        setHasMore(data.length >= limit);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching companies";
        showNotification(errorMessage, "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [showNotification],
  );

  // Load initial params from URL
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialItemsPerPage = parseInt(searchParams.get("limit") || "10", 10);

    const initialCategory = searchParams.get("mainbusinesslineid") || "";
    const urlCities = searchParams.getAll("cities");

    setPage(initialPage);
    setItemsPerPage(initialItemsPerPage);
    setSelectedCategoryId(initialCategory);
    setSelectedCities(urlCities);

    fetchCompanies({
      pageNumber: initialPage,
      limit: initialItemsPerPage,
      append: false,
      mainbusinesslineid: initialCategory || undefined,
      cities: urlCities.length ? urlCities : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch filter options (cities and categories)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [citiesData, categoriesData, generalData] = await Promise.all([
          companyService.getCities(),
          companyService.getCategories(),
          companyService.getGeneralCategories(),
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
        setGeneralCategories(generalData);
      } catch {
        // Non-fatal; filters just won't load
      }
    };

    loadOptions();
  }, []);

  // Refetch when itemsPerPage changes
  useEffect(() => {
    if (page === 1 && itemsPerPage === 10) return;

    setLoading(true);
    fetchCompanies({
      pageNumber: 1,
      limit: itemsPerPage,
      append: false,
      mainbusinesslineid: selectedCategoryId || undefined,
      cities: selectedCities.length ? selectedCities : undefined,
    });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage]);

  // Refetch on filter changes
  useEffect(() => {
    // Skip the first render handled by initial effect
    if (!loading) {
      setLoading(true);
      fetchCompanies({
        pageNumber: 1,
        limit: itemsPerPage,
        append: false,
        mainbusinesslineid: selectedCategoryId || undefined,
        cities: selectedCities.length ? selectedCities : undefined,
      });
      setPage(1);

      // Update URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", "1");
      newSearchParams.set("limit", itemsPerPage.toString());

      if (selectedCategoryId) {
        newSearchParams.set("mainbusinesslineid", selectedCategoryId);
      } else {
        newSearchParams.delete("mainbusinesslineid");
      }

      newSearchParams.delete("cities");
      for (const c of selectedCities) {
        newSearchParams.append("cities", c);
      }

      navigate(`?${newSearchParams.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedCities]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchCompanies({
      pageNumber: nextPage,
      limit: itemsPerPage,
      append: true,
      mainbusinesslineid: selectedCategoryId || undefined,
      cities: selectedCities.length ? selectedCities : undefined,
    });

    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", nextPage.toString());
    newSearchParams.set("limit", itemsPerPage.toString());
    if (selectedCategoryId) {
      newSearchParams.set("mainbusinesslineid", selectedCategoryId);
    }
    newSearchParams.delete("cities");
    for (const c of selectedCities) {
      newSearchParams.append("cities", c);
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleItemsPerPageChange = (e: {
    value: { label: string; value: number };
  }) => {
    const newValue = e.value.value;
    setItemsPerPage(newValue);

    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    newSearchParams.set("limit", newValue.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleCityChange = (citiesNew: string[]) => {
    setSelectedCities(citiesNew);
  };

  const handleCategoryChange = (event: { value: string }) => {
    setSelectedCategoryId(event.value);
  };

  const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((opt) => ({
    label: opt.toString(),
    value: opt,
  }));

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <>
        <SEO
          title={`${t("navigation.companies")} - ${t("app.title")}`}
          description={`Browse and discover companies in Finland. Find job opportunities and connect with Finnish businesses.`}
          keywords="Finnish companies, companies in Finland, job opportunities, business directory, Helsinki companies"
          url={currentUrl}
        />
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <ProgressSpinner />
          </div>
        </div>
      </>
    );
  }

  if (companies.length === 0) {
    return (
      <>
        <SEO
          title={`${t("navigation.companies")} - ${t("app.title")}`}
          description={`Browse and discover companies in Finland. Find job opportunities and connect with Finnish businesses.`}
          keywords="Finnish companies, companies in Finland, job opportunities, business directory, Helsinki companies"
          url={currentUrl}
        />
        <div className={styles.container}>
          <p className={styles.noCompanies}>{t("common.noCompanies")}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t("navigation.companies")} - ${t("app.title")}`}
        description={`Browse and discover companies in Finland. Find job opportunities and connect with Finnish businesses. View ${companies.length} companies and filter by location and category.`}
        keywords="Finnish companies, companies in Finland, job opportunities, business directory, Helsinki companies"
        url={currentUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${t("navigation.companies")} - ${t("app.title")}`,
          description: `Browse companies in Finland`,
          url: currentUrl,
        }}
      />
      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.filterCities}>
            <CompanyFilter
              cities={cities}
              selectedCities={selectedCities}
              onCityChange={handleCityChange}
            />
          </div>
          <div className={styles.filterCategory}>
            <CategoryFilter
              categories={categories}
              generalCategories={generalCategories}
              value={selectedCategoryId}
              onChange={handleCategoryChange}
            />
          </div>
          <div className={styles.filterPerPage}>
            <Dropdown
              value={
                itemsPerPageOptions.find((opt) => opt.value === itemsPerPage) ||
                itemsPerPageOptions[0]
              }
              options={itemsPerPageOptions}
              onChange={handleItemsPerPageChange}
              optionLabel="label"
              optionValue="value"
              placeholder={t("common.itemsPerPage")}
              className={styles.itemsPerPageDropdown}
              appendTo="self"
            />
          </div>
        </div>
        <div className={styles.grid}>
          {companies.map((company, index) => {
            // Calculate delay: for new cards (after append), use relative index
            // For initial load, use absolute index
            const delayIndex =
              index < previousCountRef.current
                ? index
                : index - previousCountRef.current;
            return (
              <Card
                key={company.id}
                className={styles.card}
                style={{
                  animationDelay: `${delayIndex * 0.1}s`,
                }}
              >
                <FavouriteButton
                  companyId={company.id}
                  className={styles.favouriteButtonCard}
                />
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{company.name}</h3>
                  </div>
                  <p className={styles.cardSubtitle}>
                    {company.mainbusinesslinename || ""}
                  </p>
                  {company.updated_at && (
                    <p className={styles.cardUpdated}>
                      {t("company.updatedAt")}:{" "}
                      {formatDate(company.updated_at) || company.updated_at}
                    </p>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <Button
                    label={t("common.viewDetails")}
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className={styles.viewDetailsButton}
                  />
                </div>
              </Card>
            );
          })}
        </div>
        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <Button
              label={loadingMore ? t("common.loading") : t("common.showMore")}
              onClick={handleLoadMore}
              disabled={loadingMore}
              loading={loadingMore}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Companies;
