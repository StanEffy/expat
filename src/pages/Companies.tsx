import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import Button from "../components/Common/Button";
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

const getCompanyInitial = (name?: string | null): string => {
  if (!name) return "C";
  const clean = name.replace(/^[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF]+/, "").trim();
  return (clean.charAt(0) || name.charAt(0) || "C").toUpperCase();
};

const Companies = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search filter
  const [searchName, setSearchName] = useState(searchParams.get("name") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("name") || "");

  // City & Category filters
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.getAll("cities"));

  const [categories, setCategories] = useState<BackendCategoryItem[]>([]);
  const [generalCategories, setGeneralCategories] = useState<GeneralCategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    searchParams.get("mainbusinesslineid") || ""
  );

  const previousCountRef = useRef(0);
  const isInitialMount = useRef(true);

  const fetchCompanies = useCallback(
    async ({
      pageNumber,
      limit,
      append = false,
      name: filterName,
      mainbusinesslineid,
      cities: filterCities,
    }: {
      pageNumber: number;
      limit: number;
      append?: boolean;
      name?: string;
      mainbusinesslineid?: string;
      cities?: string[];
    }) => {
      try {
        const { data, count: totalCountResult } = await companyService.getCompanies({
          page: pageNumber,
          count: limit,
          name: filterName,
          mainbusinesslineid,
          cities: filterCities,
        });

        if (typeof totalCountResult === "number") {
          setTotalCount(totalCountResult);
        }

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

        let nextHasMore = true;
        if (data.length < limit) {
          nextHasMore = false;
        }
        if (typeof totalCountResult === "number" && pageNumber * limit >= totalCountResult) {
          nextHasMore = false;
        }
        setHasMore(nextHasMore);
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
    [showNotification]
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchName]);

  // Initial fetch on mount
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialLimit = parseInt(searchParams.get("limit") || "10", 10);
    const initialCategory = searchParams.get("mainbusinesslineid") || "";
    const initialName = searchParams.get("name") || "";
    const urlCities = searchParams.getAll("cities");

    setPage(initialPage);
    setItemsPerPage(initialLimit);
    setSelectedCategoryId(initialCategory);
    setSearchName(initialName);
    setDebouncedSearch(initialName);
    setSelectedCities(urlCities);

    fetchCompanies({
      pageNumber: initialPage,
      limit: initialLimit,
      append: false,
      name: initialName || undefined,
      mainbusinesslineid: initialCategory || undefined,
      cities: urlCities.length ? urlCities : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch filter options (cities & categories)
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
        // Non-fatal
      }
    };

    loadOptions();
  }, []);

  // Refetch when filters change (search, category, cities)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setLoading(true);
    fetchCompanies({
      pageNumber: 1,
      limit: itemsPerPage,
      append: false,
      name: debouncedSearch.trim() || undefined,
      mainbusinesslineid: selectedCategoryId || undefined,
      cities: selectedCities.length ? selectedCities : undefined,
    });
    setPage(1);

    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    newSearchParams.set("limit", itemsPerPage.toString());
    if (debouncedSearch.trim()) {
      newSearchParams.set("name", debouncedSearch.trim());
    }
    if (selectedCategoryId) {
      newSearchParams.set("mainbusinesslineid", selectedCategoryId);
    }
    for (const c of selectedCities) {
      newSearchParams.append("cities", c);
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategoryId, selectedCities]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchCompanies({
      pageNumber: nextPage,
      limit: itemsPerPage,
      append: true,
      name: debouncedSearch.trim() || undefined,
      mainbusinesslineid: selectedCategoryId || undefined,
      cities: selectedCities.length ? selectedCities : undefined,
    });

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", nextPage.toString());
    newSearchParams.set("limit", itemsPerPage.toString());
    if (debouncedSearch.trim()) {
      newSearchParams.set("name", debouncedSearch.trim());
    }
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
    value: number | { label: string; value: number };
  }) => {
    const newValue =
      typeof e.value === "object" && e.value !== null
        ? e.value.value
        : (e.value as number);

    setItemsPerPage(newValue);
    setLoading(true);
    fetchCompanies({
      pageNumber: 1,
      limit: newValue,
      append: false,
      name: debouncedSearch.trim() || undefined,
      mainbusinesslineid: selectedCategoryId || undefined,
      cities: selectedCities.length ? selectedCities : undefined,
    });
    setPage(1);

    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    newSearchParams.set("limit", newValue.toString());
    if (debouncedSearch.trim()) {
      newSearchParams.set("name", debouncedSearch.trim());
    }
    if (selectedCategoryId) {
      newSearchParams.set("mainbusinesslineid", selectedCategoryId);
    }
    for (const c of selectedCities) {
      newSearchParams.append("cities", c);
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setDebouncedSearch("");
    setSelectedCategoryId("");
    setSelectedCities([]);
  };

  const hasActiveFilters = Boolean(
    searchName.trim() || selectedCategoryId || selectedCities.length > 0
  );

  const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map((opt) => ({
    label: opt.toString(),
    value: opt,
  }));

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEO
        title={`${t("navigation.companies")} - ${t("app.title")}`}
        description="Browse and discover companies in Finland. Find job opportunities and connect with Finnish businesses."
        keywords="Finnish companies, companies in Finland, job opportunities, business directory, Helsinki companies"
        url={currentUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${t("navigation.companies")} - ${t("app.title")}`,
          description: "Browse companies in Finland",
          url: currentUrl,
        }}
      />
      <main className={styles.container}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <div className={styles.pageTitleGroup}>
              <h1 className={styles.pageTitle}>{t("navigation.companies")}</h1>
              {totalCount !== null && (
                <span
                  className={styles.countBadge}
                  aria-label={`${totalCount} companies available`}
                >
                  <i className="pi pi-building" aria-hidden="true" />
                  {totalCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <p className={styles.pageSubtitle}>
            {t(
              "company.pageSubtitle",
              "Discover, search, and connect with registered businesses and organizations across Finland."
            )}
          </p>
        </header>

        {/* Filter Controls Card */}
        <section className={styles.filterCard} aria-label="Search and filter options">
          <div className={styles.filtersGrid}>
            <div className={styles.searchWrapper}>
              <i className="pi pi-search" aria-hidden="true" />
              <InputText
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={t("company.searchPlaceholder", {
                  defaultValue: "Search companies by name...",
                })}
                className={styles.searchInput}
                aria-label={t("company.searchPlaceholder", {
                  defaultValue: "Search companies by name",
                })}
              />
            </div>

            <div className={styles.filterCol}>
              <CompanyFilter
                cities={cities}
                selectedCities={selectedCities}
                onCityChange={setSelectedCities}
              />
            </div>

            <div className={styles.filterCol}>
              <CategoryFilter
                categories={categories}
                generalCategories={generalCategories}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className={styles.filterActionsBar}>
              <span className={styles.activeFiltersText}>
                {t("company.activeFiltersApplied", {
                  defaultValue: "Active filters:",
                })}
                {searchName.trim() && ` "${searchName.trim()}"`}
                {selectedCities.length > 0 &&
                  ` • ${selectedCities.length} ${t("company.citiesFilterLabel", { defaultValue: "cities" })}`}
                {selectedCategoryId &&
                  ` • 1 ${t("company.categoryFilterLabel", { defaultValue: "category" })}`}
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className={styles.clearFiltersBtn}
                aria-label={t("company.clearFilters", { defaultValue: "Clear filters" })}
              >
                <i
                  className="pi pi-times"
                  style={{ marginRight: 6, fontSize: "0.75rem" }}
                  aria-hidden="true"
                />
                {t("company.clearFilters", { defaultValue: "Clear filters" })}
              </button>
            </div>
          )}
        </section>

        {/* Content State: Loading, Empty, or Cards Grid */}
        {loading ? (
          <div className={styles.loadingContainer} role="status" aria-live="polite">
            <ProgressSpinner strokeWidth="3" />
            <p>{t("common.loading", { defaultValue: "Loading companies..." })}</p>
          </div>
        ) : !Array.isArray(companies) || companies.length === 0 ? (
          <div className={styles.emptyContainer} role="status">
            <div className={styles.emptyIconCircle} aria-hidden="true">
              <i className="pi pi-search" />
            </div>
            <h2 className={styles.emptyTitle}>
              {t("common.noCompanies", "No companies found")}
            </h2>
            <p className={styles.emptySubtitle}>
              {t("company.noResultsHint", {
                defaultValue:
                  "Try adjusting your search terms or filters to find what you are looking for.",
              })}
            </p>
            {hasActiveFilters && (
              <Button
                label={t("company.resetFilters", { defaultValue: "Reset all filters" })}
                icon="pi pi-filter-slash"
                onClick={handleClearFilters}
                className={styles.emptyResetBtn}
              />
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {companies.map((company, index) => {
                const delayIndex =
                  index < previousCountRef.current
                    ? index
                    : index - previousCountRef.current;
                const initialLetter = getCompanyInitial(company.name);
                const updatedFormatted = formatDate(company.updated_at);

                return (
                  <article
                    key={company.id}
                    className={styles.card}
                    style={{
                      animationDelay: `${Math.min(delayIndex * 0.04, 0.4)}s`,
                    }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.avatarAndInfo}>
                        <div className={styles.companyAvatar} aria-hidden="true">
                          {initialLetter}
                        </div>
                        <div className={styles.companyMeta}>
                          <h2
                            className={styles.cardTitle}
                            onClick={() => navigate(`/companies/${company.id}`)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                navigate(`/companies/${company.id}`);
                              }
                            }}
                          >
                            {company.name}
                          </h2>
                          {company.mainbusinesslinename && (
                            <span
                              className={styles.categoryBadge}
                              title={company.mainbusinesslinename}
                            >
                              {company.mainbusinesslinename}
                            </span>
                          )}
                        </div>
                      </div>
                      <FavouriteButton
                        companyId={company.id}
                        className={styles.favouriteButtonCard}
                      />
                    </div>

                    <div className={styles.cardFooter}>
                      {company.updated_at && (
                        <div className={styles.cardUpdated}>
                          <i className="pi pi-calendar" aria-hidden="true" />
                          <span>
                            {t("company.updatedAt", { defaultValue: "Updated" })}:{" "}
                            {updatedFormatted || company.updated_at}
                          </span>
                        </div>
                      )}
                      <Button
                        label={t("common.viewDetails")}
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => navigate(`/companies/${company.id}`)}
                        className={styles.viewDetailsButton}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            {companies.length > 0 && (
              <div className={styles.loadMoreContainer}>
                {hasMore && (
                  <Button
                    label={loadingMore ? t("common.loading") : t("common.showMore")}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    loading={loadingMore}
                    className={styles.loadMoreBtn}
                  />
                )}
                <div className={styles.perPageWrapper}>
                  <label htmlFor="items-per-page" className={styles.perPageLabel}>
                    {t("common.itemsPerPage")}:
                  </label>
                  <Dropdown
                    inputId="items-per-page"
                    value={itemsPerPage}
                    options={itemsPerPageOptions}
                    onChange={handleItemsPerPageChange}
                    optionLabel="label"
                    optionValue="value"
                    className={styles.itemsPerPageDropdown}
                    appendTo="self"
                    aria-label={t("common.itemsPerPage")}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Companies;
