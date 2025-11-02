import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { FAVOURITES_ENDPOINTS } from "../constants/api";
import { getAuthHeaders } from "../utils/auth";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import styles from "./FavouriteButton.module.scss";

interface FavouriteButtonProps {
  companyId: number;
  className?: string;
}

const FavouriteButton = ({ companyId, className }: FavouriteButtonProps) => {
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  // Check if company is already in favourites
  useEffect(() => {
    const checkFavourite = async () => {
      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          setChecking(false);
          return;
        }

        const response = await fetch(FAVOURITES_ENDPOINTS.LIST, { headers });

        if (response.ok) {
          const data = await response.json();
          const favouriteIds = Array.isArray(data)
            ? data.map((fav: any) => fav.company_id || fav.companyId)
            : [];
          setIsFavourite(favouriteIds.includes(companyId));
        }
      } catch (err) {
        // Silent fail - user might not be logged in
      } finally {
        setChecking(false);
      }
    };

    checkFavourite();
  }, [companyId]);

  const handleToggleFavourite = async () => {
    if (loading || checking) return;

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        showNotification("Please log in to add favourites", "warning");
        return;
      }

      const endpoint = isFavourite
        ? FAVOURITES_ENDPOINTS.REMOVE(companyId)
        : FAVOURITES_ENDPOINTS.ADD(companyId);

      const method = isFavourite ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to update favourite");
      }

      setIsFavourite(!isFavourite);
      showNotification(
        isFavourite
          ? t("favourites.removedFromFavourites")
          : t("favourites.addedToFavourites"),
        "success",
      );
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "An error occurred",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return null; // Don't show button while checking
  }

  return (
    <Button
      icon={isFavourite ? "pi pi-heart-fill" : "pi pi-heart"}
      className={`${styles.favouriteButton} ${isFavourite ? styles.favourite : ""} ${className || ""}`}
      onClick={handleToggleFavourite}
      loading={loading}
      aria-label={
        isFavourite
          ? t("favourites.removeFromFavourites")
          : t("favourites.addToFavourites")
      }
      severity="secondary"
      text
    />
  );
};

export default FavouriteButton;
