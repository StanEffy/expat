import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "primereact/card";
import Button from "../components/Common/Button";
import { COMPANY_ENDPOINTS } from "../constants/api";
import { getAuthHeaders } from "../utils/auth";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import CompanyInfoEditor from "../components/Companies/CompanyInfoEditor";
import FavouriteButton from "../components/Common/FavouriteButton";
import SEO from "../components/Common/SEO";
import mapBg from "../assets/map_bg.png";
import styles from "./CompanyDetails.module.scss";

interface CompanyDetails {
  id: number;
  businessid: string;
  name: string;
  mainbusinesslinename: string;
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
  updated_at?: string | null;
}

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!id) return;

      try {
        const headers = getAuthHeaders();
        if (!headers) {
          return;
        }

        const response = await fetch(COMPANY_ENDPOINTS.DETAILS(id), {
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch company details",
          );
        }

        const data = await response.json();

        if (data.length > 0) {
          setCompany(data[0]);
        } else {
          setError("Company not found");
          showNotification("Company not found", "error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching company details";
        setError(errorMessage);
        showNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id, showNotification]);

  const getGoogleMapsUrl = (company: CompanyDetails) => {
    const address = `${company.street} ${company.buildingnumber}${
      company.apartmentnumber ? `, ${company.apartmentnumber}` : ""
    }, ${company.postcode} ${company.city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
  };

  const handleComplainToVero = () => {
    // Generate random complaint ID
    const randomId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const complaintId = randomId.toUpperCase().substring(0, 12);
    showNotification(
      t("company.complaintSentWithId", { id: complaintId }),
      "success",
    );
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <>
        <SEO
          title={`${t("company.information")} - ${t("app.title")}`}
          description="Loading company information..."
          url={currentUrl}
        />
        <div className={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={`${t("company.information")} - ${t("app.title")}`}
          description="Company information not available"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <SEO
          title={`${t("company.information")} - ${t("app.title")}`}
          description="Company not found"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.errorContainer}>
          <p className={styles.notFoundText}>Company not found.</p>
        </div>
      </>
    );
  }

  const companyDescription =
    company.company_description ||
    `${company.name} is a ${company.mainbusinesslinename || "company"} based in ${company.city || "Finland"}. ${company.recruitment_page ? "Visit our recruitment page for job opportunities." : ""}`;

  const companyAddress =
    company.street && company.city
      ? `${company.street} ${company.buildingnumber}${company.apartmentnumber ? `, ${company.apartmentnumber}` : ""}, ${company.postcode} ${company.city}`
      : null;

  return (
    <>
      <SEO
        title={`${company.name} - ${t("app.title")}`}
        description={companyDescription}
        keywords={`${company.name}, ${company.mainbusinesslinename || ""}, Finland, ${company.city || ""}, company, business`}
        url={currentUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: company.name,
          description: companyDescription,
          url: company.website ? `https://${company.website}` : undefined,
          address: companyAddress
            ? {
                "@type": "PostalAddress",
                streetAddress: `${company.street} ${company.buildingnumber}${company.apartmentnumber ? `, ${company.apartmentnumber}` : ""}`,
                addressLocality: company.city,
                postalCode: company.postcode,
                addressCountry: company.country || "FI",
              }
            : undefined,
          industry: company.mainbusinesslinename,
          foundingDate: company.founded || undefined,
          numberOfEmployees: company.size || undefined,
        }}
      />
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{company.name}</h1>
          <FavouriteButton
            companyId={company.id}
            className={styles.favouriteButtonDetails}
          />
        </div>
        <div className={styles.content}>
          <Card className={styles.card} title={t("company.information")}>
            <div className={styles.complainButtonContainer}>
              <Button
                label={t("company.complainToVero")}
                onClick={handleComplainToVero}
                className={styles.complainButton}
                icon="pi pi-send"
                outlined
              />
            </div>
            <div className={styles.infoSection}>
              <p>
                <strong>{t("company.businessId")}:</strong> {company.businessid}
              </p>
              <p>
                <strong>{t("company.mainBusinessLine")}:</strong>{" "}
                {company.mainbusinesslinename}
              </p>
              {company.website && (
                <p>
                  <strong>{t("company.website")}:</strong>{" "}
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.website}
                  </a>
                </p>
              )}
              <p>
                <strong>{t("company.updatedAt")}:</strong>{" "}
                {company.updated_at 
                  ? new Date(company.updated_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </Card>

          {company.street && company.city && (
            <a
              href={getGoogleMapsUrl(company)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.addressLink}
            >
              <Card className={styles.addressCard}>
                <div
                  className={styles.addressCardBackground}
                  style={
                    {
                      "--map-bg-url": `url(${mapBg})`,
                    } as React.CSSProperties
                  }
                />
                <div className={styles.addressCardOverlay} />
                <div className={styles.addressCardContent}>
                  <h3 className={styles.addressTitle}>
                    {t("company.address")}
                  </h3>
                  <p>
                    {company.street} {company.buildingnumber}
                    {company.apartmentnumber && `, ${company.apartmentnumber}`}
                  </p>
                  <p>
                    {company.postcode} {company.city}
                  </p>
                </div>
              </Card>
            </a>
          )}

          {company.company_description && (
            <Card title={t("company.description")}>
              <p>{company.company_description}</p>
            </Card>
          )}


          {company.recruitment_page && (
            <Card title={t("company.recruitment")}>
              <a
                href={company.recruitment_page}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("company.visitRecruitmentPage")}
              </a>
            </Card>
          )}

          <CompanyInfoEditor
            companyId={id!}
            initialData={{
              company_description: company.company_description,
              recruitment_page: company.recruitment_page,
            }}
            onUpdate={(updatedData) => {
              setCompany((prev) =>
                prev
                  ? {
                      ...prev,
                      ...updatedData,
                    }
                  : null,
              );
            }}
          />
        </div>
      </div>
    </>
  );
};

export default CompanyDetails;
