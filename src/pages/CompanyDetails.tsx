import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import Button from "../components/Common/Button";
import { companyService } from "@/services/companyService";
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
  const [copiedId, setCopiedId] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!id) return;

      try {
        const data = await companyService.getCompanyDetails(id);
        setCompany(data);
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

  const handleCopyBusinessId = async () => {
    if (!company?.businessid) return;
    try {
      await navigator.clipboard.writeText(company.businessid);
      setCopiedId(true);
      showNotification(
        t("company.copiedBusinessId", { defaultValue: "Business ID copied to clipboard" }),
        "success"
      );
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      showNotification("Failed to copy", "error");
    }
  };

  const handleComplainToVero = () => {
    const randomId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const complaintId = randomId.toUpperCase().substring(0, 12);
    showNotification(
      t("company.complaintSentWithId", { id: complaintId }),
      "success",
    );
  };

  const getCompanyInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
        <div className={styles.container}>
          <div className={styles.loadingWrapper}>
            <ProgressSpinner strokeWidth="4" />
            <p className={styles.loadingText}>
              {t("common.loading", { defaultValue: "Loading company details..." })}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <SEO
          title={`${t("company.information")} - ${t("app.title")}`}
          description="Company information not available"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <i className={`pi pi-exclamation-triangle ${styles.errorIcon}`} />
            <h2>{t("common.error", { defaultValue: "Something went wrong" })}</h2>
            <p className={styles.errorText}>
              {error || t("common.notFound", { defaultValue: "Company not found." })}
            </p>
            <Link to="/companies" className={styles.backButton}>
              <i className="pi pi-arrow-left" />
              <span>{t("common.back", { defaultValue: "Back to Companies" })}</span>
            </Link>
          </div>
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

  const websiteUrl = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
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
        {/* Navigation Breadcrumb */}
        <div className={styles.topNav}>
          <Link to="/companies" className={styles.backLink}>
            <i className="pi pi-arrow-left" />
            <span>{t("common.back", { defaultValue: "Back to Companies" })}</span>
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className={styles.heroCard}>
          <div className={styles.heroMain}>
            <div className={styles.avatar}>
              {getCompanyInitials(company.name)}
            </div>
            <div className={styles.heroDetails}>
              <div className={styles.heroNameRow}>
                <h1 className={styles.title}>{company.name}</h1>
              </div>
              <div className={styles.badgeRow}>
                {company.city && (
                  <span className={styles.badge}>
                    <i className="pi pi-map-marker" />
                    <span>{company.city}</span>
                  </span>
                )}
                {company.mainbusinesslinename && (
                  <span className={styles.badge}>
                    <i className="pi pi-briefcase" />
                    <span>{company.mainbusinesslinename}</span>
                  </span>
                )}
                {company.businessid && (
                  <button
                    type="button"
                    onClick={handleCopyBusinessId}
                    className={`${styles.badge} ${styles.copyBadge}`}
                    title="Click to copy Business ID"
                  >
                    <i className="pi pi-id-card" />
                    <span>{company.businessid}</span>
                    <i
                      className={`pi ${copiedId ? "pi-check" : "pi-copy"} ${styles.copyIcon}`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <FavouriteButton
              companyId={company.id}
              className={styles.favouriteButtonDetails}
            />

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.websiteBtn}
              >
                <i className="pi pi-globe" />
                <span>{t("company.website", { defaultValue: "Website" })}</span>
                <i className="pi pi-external-link" />
              </a>
            )}

            <Button
              label={t("company.complainToVero")}
              onClick={handleComplainToVero}
              className={styles.complainButton}
              icon="pi pi-flag"
              outlined
              size="small"
            />
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className={styles.layoutGrid}>
          {/* Left Column: Description, Recruitment, Editor */}
          <div className={styles.mainColumn}>
            {/* Description Card */}
            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <i className="pi pi-align-left" />
                  <h2>{t("company.description")}</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.descriptionText}>
                  {company.company_description || (
                    <span className={styles.emptyText}>
                      {t("company.noDescriptionYet", {
                        defaultValue: `${company.name} has not added an extended description yet. You can suggest an update below.`,
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Recruitment Highlight Banner */}
            {company.recruitment_page && (
              <div className={styles.recruitmentCard}>
                <div className={styles.recruitmentContent}>
                  <div className={styles.recruitmentIconWrapper}>
                    <i className="pi pi-briefcase" />
                  </div>
                  <div className={styles.recruitmentText}>
                    <h3 className={styles.recruitmentTitle}>{t("company.recruitment")}</h3>
                    <p className={styles.recruitmentDesc}>
                      {t("company.recruitmentPrompt", {
                        defaultValue: "This company is currently hiring. Explore career opportunities on their recruitment portal.",
                      })}
                    </p>
                  </div>
                </div>
                <a
                  href={company.recruitment_page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.recruitmentButton}
                >
                  <span>{t("company.visitRecruitmentPage")}</span>
                  <i className="pi pi-external-link" />
                </a>
              </div>
            )}

            {/* Edit Company Information Accordion */}
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

          {/* Right Column: Information Overview & Location */}
          <div className={styles.sidebarColumn}>
            {/* Information Overview */}
            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <i className="pi pi-info-circle" />
                  <h3>{t("company.information")}</h3>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <i className="pi pi-id-card" />
                      {t("company.businessId")}
                    </span>
                    <span className={styles.infoValue}>{company.businessid}</span>
                  </div>

                  {company.mainbusinesslinename && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <i className="pi pi-briefcase" />
                        {t("company.mainBusinessLine")}
                      </span>
                      <span className={styles.infoValue}>
                        {company.mainbusinesslinename}
                      </span>
                    </div>
                  )}

                  {websiteUrl && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <i className="pi pi-globe" />
                        {t("company.website")}
                      </span>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.infoLink}
                      >
                        <span>{company.website.replace(/^https?:\/\//, "")}</span>
                        <i className="pi pi-external-link" />
                      </a>
                    </div>
                  )}

                  {company.country && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <i className="pi pi-flag" />
                        {t("company.country", { defaultValue: "Country" })}
                      </span>
                      <span className={styles.infoValue}>{company.country}</span>
                    </div>
                  )}

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <i className="pi pi-calendar" />
                      {t("company.updatedAt")}
                    </span>
                    <span className={styles.infoValue}>
                      {company.updated_at
                        ? new Date(company.updated_at).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Interactive Map Card */}
            {company.street && company.city && (
              <div className={styles.glassCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-map-marker" />
                    <h3>{t("company.address")}</h3>
                  </div>
                </div>
                <div className={styles.addressBody}>
                  <a
                    href={getGoogleMapsUrl(company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapBanner}
                    style={
                      {
                        "--map-bg-url": `url(${mapBg})`,
                      } as React.CSSProperties
                    }
                  >
                    <div className={styles.mapOverlay} />
                    <div className={styles.mapPin}>
                      <i className="pi pi-map-marker" />
                    </div>
                    <div className={styles.mapBadge}>
                      <i className="pi pi-external-link" />
                      <span>Google Maps</span>
                    </div>
                  </a>

                  <div className={styles.addressDetails}>
                    <p className={styles.addressStreet}>
                      {company.street} {company.buildingnumber}
                      {company.apartmentnumber && `, ${company.apartmentnumber}`}
                    </p>
                    <p className={styles.addressCity}>
                      {company.postcode} {company.city}
                    </p>
                    <a
                      href={getGoogleMapsUrl(company)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.openMapBtn}
                    >
                      <i className="pi pi-directions" />
                      <span>
                        {t("company.openInMaps", {
                          defaultValue: "Open in Google Maps",
                        })}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDetails;
