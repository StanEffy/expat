import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useNotification } from "../contexts/NotificationContext";
import { getAuthHeaders } from "../utils/auth";
import { COMPANY_ENDPOINTS } from "../constants/api";

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
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setExpanded(false);
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

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  // Check if both fields are empty
  const isFormEmpty = !formData.company_description.trim() && !formData.recruitment_page.trim();

  return (
    <Box sx={{ mt: 3 }}>
      <Accordion expanded={expanded} onChange={toggleAccordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="company-info-content"
          id="company-info-header"
        >
          <Typography variant="subtitle1">{t("company.editInformation")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit}>
            <Paper elevation={0} sx={{ p: 1 }}>
              <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
                <Box>
                  <TextField
                    fullWidth
                    label={t("company.description")}
                    name="company_description"
                    value={formData.company_description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label={t("company.recruitmentPageUrl")}
                    name="recruitment_page"
                    value={formData.recruitment_page}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="https://example.com/careers"
                  />
                </Box>
                <Box>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isFormEmpty || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? t("common.updating") : t("company.updateInformation")}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t("company.confirmUpdate")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("company.confirmUpdateMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleConfirmUpdate} 
            autoFocus 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t("common.updating") : t("common.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyInfoEditor;
