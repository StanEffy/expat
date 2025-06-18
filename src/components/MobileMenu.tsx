import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const MobileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenu}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            minWidth: "200px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
            top: "64px!important",
          },
          "& .MuiMenuItem-root": {
            fontSize: "16px",
            padding: "8px 16px",
          },
        }}
      >
        <MenuItem onClick={() => handleNavigation("/")}>
          {t("navigation.home")}
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/companies")}>
          {t("navigation.companies")}
        </MenuItem>
        <MenuItem onClick={() => handleNavigation("/about")}>
          {t("navigation.about")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default MobileMenu;
