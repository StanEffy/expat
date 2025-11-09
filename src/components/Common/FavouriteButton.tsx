import { useState } from "react";
import Button from "./Button";
import { useNotification } from "../../contexts/NotificationContext";
import { useFavourites } from "../../contexts/FavouritesContext";
import { useTranslation } from "react-i18next";
import styles from "./FavouriteButton.module.scss";

interface FavouriteButtonProps {
  companyId: number;
  className?: string;
}

const FavouriteButton = ({ companyId, className }: FavouriteButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { isFavourite, toggleFavourite } = useFavourites();

  const isFavouriteValue = isFavourite(companyId);

  const handleToggleFavourite = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const success = await toggleFavourite(companyId);

      if (!success) {
        throw new Error("Failed to update favourite");
      }

      showNotification(
        isFavouriteValue
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

  return (
    <Button
      icon={isFavouriteValue ? "pi pi-heart-fill" : "pi pi-heart"}
      className={`${styles.favouriteButton} ${isFavouriteValue ? styles.favourite : ""} ${className || ""}`}
      onClick={handleToggleFavourite}
      loading={loading}
      aria-label={
        isFavouriteValue
          ? t("favourites.removeFromFavourites")
          : t("favourites.addToFavourites")
      }
      severity="secondary"
      text
    />
  );
};

export default FavouriteButton;
