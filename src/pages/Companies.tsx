import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { COMPANY_ENDPOINTS, CITY_ENDPOINTS, CATEGORY_ENDPOINTS } from "../constants/api";
import { getAuthHeaders } from "../utils/auth";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import CompanyFilter from "../components/CompanyFilter";
import CategoryFilter from "../components/CategoryFilter";
import type { GeneralCategoryItem } from "../components/CategoryFilter";

interface Company {
  id: number;
  name: string;
  mainbusinesslinename?: string | null;
}

interface BackendCityItem {
  city?: string | null;
}

interface BackendCategoryItem {
  mainbusinessline?: string | null; // id (code)
  name?: string | null; // FI
  name_en?: string | null; // EN
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [categories, setCategories] = useState<BackendCategoryItem[]>([]);
  const [generalCategories, setGeneralCategories] = useState<GeneralCategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Load initial params from URL
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1");
    const initialItemsPerPage = parseInt(searchParams.get("limit") || "10");

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
  }, []);

  // Fetch filter options (cities and categories)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          return;
        }

        const [citiesRes, categoriesRes] = await Promise.all([
          fetch(CITY_ENDPOINTS.LIST, { headers }),
          fetch(CATEGORY_ENDPOINTS.LIST, { headers }),
        ]);

        const generalRes = await fetch(CATEGORY_ENDPOINTS.GENERAL, { headers });

        if (citiesRes.ok) {
          const { data: citiesData } = await citiesRes.json();
          const options = (citiesData as BackendCityItem[])
            .map((c) => (c.city ?? "").toString())
            .filter((c) => c && c.length > 0);
          setCities(options);
        }

        if (categoriesRes.ok) {
          const { data: categoriesData } = await categoriesRes.json();
          setCategories(categoriesData as BackendCategoryItem[]);
        }
        if (generalRes.ok) {
          const { data: generalData } = await generalRes.json();
          setGeneralCategories(generalData as GeneralCategoryItem[]);
        }
      } catch (err) {
        // Non-fatal; filters just won't load
      }
    };

    loadOptions();
  }, []);

  const fetchCompanies = async ({
    pageNumber,
    limit,
    append = false,
    mainbusinesslineid,
    cities,
  }: {
    pageNumber: number;
    limit: number;
    append?: boolean;
    mainbusinesslineid?: string;
    cities?: string[];
  }) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        return;
      }

      let url: string;
      if (selectedCategoryId.startsWith('general:')) {
        const generalCode = selectedCategoryId.split(':')[1];
        const page = pageNumber;
        const count = limit;
        const parts: string[] = [`page=${page}`, `count=${count}`, `generalcategory=${encodeURIComponent(generalCode)}`];
        if (cities && cities.length > 0) {
          for (const city of cities) parts.push(`cities=${encodeURIComponent(city)}`);
        }
        url = `${COMPANY_ENDPOINTS.LIST(page, count)}&generalcategory=${encodeURIComponent(generalCode)}${cities && cities.length ? cities.map(c => `&cities=${encodeURIComponent(c)}`).join('') : ''}`;
      } else {
        url = COMPANY_ENDPOINTS.FILTERED({
          page: pageNumber,
          count: limit,
          mainbusinesslineid,
          cities,
        });
      }

      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch companies");
      }

      const json = await response.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const totalCount: number | undefined = typeof json?.count === 'number' ? json.count : undefined;

      // If backend returns null or non-array for data, treat as empty page
      if (!Array.isArray(json?.data)) {
        // Show a gentle info when we attempted to load more but there's nothing
        if (append) {
          showNotification("No more companies", "info");
        }
      }

      setCompanies((prev) => (append ? (data.length ? [...prev, ...data] : prev) : data));

      // Determine hasMore conservatively
      let nextHasMore = true;
      if (data.length < limit) {
        nextHasMore = false;
      }
      if (typeof totalCount === 'number' && pageNumber * limit >= totalCount) {
        nextHasMore = false;
      }
      setHasMore(nextHasMore);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching companies";
      // Keep existing list; just notify the user
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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

  const handleItemsPerPageChange = (e: { value: { label: string; value: number } }) => {
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

  const itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS.map(opt => ({ label: opt.toString(), value: opt }));

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: '32px' }}>
          <ProgressSpinner />
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <p style={{ marginTop: '32px' }}>{t("common.noCompanies")}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginTop: '16px', display: "flex", gap: '16px', flexWrap: "wrap", marginBottom: '16px' }}>
        <div style={{ minWidth: '280px', flex: 1 }}>
          <CompanyFilter
            cities={cities}
            selectedCities={selectedCities}
            onCityChange={handleCityChange}
          />
        </div>
        <CategoryFilter
          categories={categories}
          generalCategories={generalCategories}
          value={selectedCategoryId}
          onChange={handleCategoryChange}
        />
        <Dropdown
          value={itemsPerPageOptions.find(opt => opt.value === itemsPerPage) || itemsPerPageOptions[0]}
          options={itemsPerPageOptions}
          onChange={handleItemsPerPageChange}
          optionLabel="label"
          optionValue="value"
          placeholder={t("common.itemsPerPage")}
          style={{ minWidth: '120px', marginLeft: "auto" }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: '24px',
          marginTop: '16px',
        }}
      >
        {companies.map((company) => (
          <Card key={company.id} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flexGrow: 1, padding: '16px' }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: 0 }}>
                {company.name}
              </h3>
              <p style={{ color: "#666", marginTop: '8px', marginBottom: 0 }}>
                {company.mainbusinesslinename || ""}
              </p>
            </div>
            <div style={{ padding: '16px' }}>
              <Button
                label={t("common.viewDetails")}
                onClick={() => navigate(`/companies/${company.id}`)}
                style={{ width: '100%' }}
              />
            </div>
          </Card>
        ))}
      </div>
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: '32px', marginBottom: '32px' }}>
          <Button
            label={loadingMore ? t("common.loading") : t("common.showMore")}
            onClick={handleLoadMore}
            disabled={loadingMore}
            loading={loadingMore}
          />
        </div>
      )}
    </div>
  );
};

export default Companies;
