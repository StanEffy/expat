import React, { useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useNotification } from "../contexts/NotificationContext";
import { getAuthHeaders } from "../utils/auth";
import { COMPANY_ENDPOINTS } from "../constants/api";
import styles from "./CompanyInfoEditor.module.scss";

interface CompanyInfoEditorProps {
  companyId: string;
  initialData: {
    company_description: string | null;
    recruitment_page: string | null;
  };
  onUpdate: (data: { company_description: string | null; recruitment_page: string | null }) => void;
}

const CompanyInfoEditor: React.FC<CompanyInfoEditorProps> = ({ 
  companyId, 
  initialData, 
  onUpdate 
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    company_description: initialData?.company_description || "",
    recruitment_page: initialData?.recruitment_page || "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        showNotification("Authentication required", "error");
        return;
      }

      const updateData = {
        company_description: formData.company_description || null,
        recruitment_page: formData.recruitment_page || null,
      };

      const response = await fetch(COMPANY_ENDPOINTS.DETAILS(companyId), {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update company information");
      }

      onUpdate(updateData);
      setOpenDialog(false);
      setExpanded(null);
      showNotification("Company information updated successfully", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while updating company information";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Check if both fields are empty
  const isFormEmpty = !formData.company_description.trim() && !formData.recruitment_page.trim();

  const footer = (
    <div>
      <Button 
        label={t("common.cancel")} 
        onClick={handleCloseDialog} 
        disabled={loading}
        text
      />
      <Button 
        label={loading ? t("common.updating") : t("common.confirm")} 
        onClick={handleConfirmUpdate} 
        disabled={loading}
        loading={loading}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <Accordion activeIndex={expanded !== null ? 0 : null} onTabChange={(e) => setExpanded(e.index !== null ? '0' : null)}>
        <AccordionTab header={t("company.editInformation")}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="p-field">
              <label htmlFor="company_description">{t("company.description")}</label>
              <InputTextarea
                id="company_description"
                name="company_description"
                value={formData.company_description}
                onChange={handleChange}
                rows={4}
                className={styles.textarea}
              />
            </div>
            <div className="p-field">
              <label htmlFor="recruitment_page">{t("company.recruitmentPageUrl")}</label>
              <InputText
                id="recruitment_page"
                name="recruitment_page"
                value={formData.recruitment_page}
                onChange={handleChange}
                placeholder="https://example.com/careers"
                className={styles.input}
              />
            </div>
            <div>
              <Button 
                type="submit" 
                label={loading ? t("common.updating") : t("company.updateInformation")}
                disabled={isFormEmpty || loading}
                loading={loading}
              />
            </div>
          </form>
        </AccordionTab>
      </Accordion>

      <Dialog
        visible={openDialog}
        onHide={handleCloseDialog}
        header={t("company.confirmUpdate")}
        footer={footer}
        modal
      >
        <p>{t("company.confirmUpdateMessage")}</p>
      </Dialog>
    </div>
  );
};

export default CompanyInfoEditor;
