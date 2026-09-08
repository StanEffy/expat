import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import Button from "../components/Common/Button";
import { Message } from "primereact/message";
import { AUTH_ENDPOINTS, DEFAULT_CONFIG, ADMIN_PANEL_PATH } from "../constants/api";
import { setToken, checkAdminRole, isTokenValid } from "../utils/auth";
import SEO from "../components/Common/SEO";
import styles from "./Login.module.scss";
import { useUserNotifications } from "../contexts/UserNotificationsContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const { refreshNotifications } = useUserNotifications();
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const getRedirectTarget = useCallback((): string | null => {
    const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } | string })?.from;
    if (typeof from === "string" && from && from !== "/login") {
      return from;
    }
    if (from && typeof from === "object" && from.pathname && from.pathname !== "/login") {
      return `${from.pathname}${from.search || ""}${from.hash || ""}`;
    }
    return null;
  }, [location.state]);

  // If already authenticated, redirect to destination or home
  useEffect(() => {
    if (isTokenValid()) {
      const target = getRedirectTarget() || "/";
      navigate(target, { replace: true });
    }
  }, [navigate, getRedirectTarget]);
  
  const observerRef = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // Callback ref guarantees height is measured on every mount/update and never collapses to 0
  const bodyRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const updateHeight = () => {
        const h = node.scrollHeight;
        if (h > 50) {
          setContentHeight(h);
        }
      };

      // Measure immediately on mount
      updateHeight();

      // Observe future resize changes
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  // Read invite code from query parameter or use default
  const inviteCodeFromQuery =
    searchParams.get("invite_code") || DEFAULT_CONFIG.INVITE_CODE;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    inviteCode: inviteCodeFromQuery,
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update invite code when query parameter changes
  useEffect(() => {
    const inviteCodeFromQuery =
      searchParams.get("invite_code") || DEFAULT_CONFIG.INVITE_CODE;
    setFormData((prev) => ({ ...prev, inviteCode: inviteCodeFromQuery }));
  }, [searchParams]);

  const handleTabChange = (index: number) => {
    setTabValue(index);
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: { value: string }, fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: e.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      setToken(data.token);
      await refreshNotifications();
      
      const target = getRedirectTarget();
      const isAdmin = await checkAdminRole();
      if (isAdmin && !target) {
        window.location.href = ADMIN_PANEL_PATH;
      } else {
        window.location.href = target || "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          invite_code: formData.inviteCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      // Automatically log in after registration
      try {
        const loginResponse = await fetch(AUTH_ENDPOINTS.LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          setToken(data.token);
          await refreshNotifications();
          
          const target = getRedirectTarget();
          const isAdmin = await checkAdminRole();
          if (isAdmin && !target) {
            window.location.href = ADMIN_PANEL_PATH;
          } else {
            window.location.href = target || "/";
          }
          return;
        }
      } catch (loginErr) {
        // If auto login fails, navigate to login page
        console.error("Auto login failed:", loginErr);
      }

      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={
          forgotPasswordMode
            ? `Reset Password - ${t('app.title')}`
            : `${t('navigation.login')} - ${t('app.title')}`
        }
        description={
          forgotPasswordMode
            ? "Reset your password for Expat App"
            : "Sign in or sign up for Expat App to access company listings and job opportunities in Finland."
        }
        keywords="expat login, sign up, Finland jobs, expat account"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            {forgotPasswordMode ? (
              <div className={styles.forgotHeader}>
                <div className={styles.forgotHeaderTitle}>
                  <i className="pi pi-lock" />
                  <span>Reset Password</span>
                </div>
              </div>
            ) : (
              <div className={styles.tabHeader} role="tablist" aria-label="Authentication Options">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabValue === 0}
                  className={`${styles.tabButton} ${tabValue === 0 ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange(0)}
                >
                  <span className={styles.tabButtonText}>Sign In</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabValue === 1}
                  className={`${styles.tabButton} ${tabValue === 1 ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange(1)}
                >
                  <span className={styles.tabButtonText}>Sign Up</span>
                </button>
              </div>
            )}

            <div
              className={styles.cardBodyWrapper}
              style={{
                height: contentHeight && contentHeight > 50 ? `${contentHeight}px` : "auto",
              }}
            >
              <div ref={bodyRefCallback} className={styles.cardBody}>
                {forgotPasswordMode ? (
                  <div key="forgot" className={styles.panelAnimated}>
                    <h2 className={styles.title}>Reset Password</h2>
                    <div className={styles.forgotPasswordMessage}>
                      <p>{t("login.forgotPasswordMessage")}</p>
                    </div>
                    <div className={styles.buttonGroup}>
                      <Button
                        label={t("login.backToLogin")}
                        onClick={() => {
                          setForgotPasswordMode(false);
                          setError("");
                        }}
                        className={styles.buttonGroupButton}
                      />
                    </div>
                  </div>
                ) : (
                  <div key={tabValue} className={styles.panelAnimated}>
                    {tabValue === 0 ? (
                      <div role="tabpanel">
                        <h2 className={styles.title}>Sign In</h2>
                        {error && (
                          <Message
                            severity="error"
                            text={error}
                            className={styles.errorMessage}
                          />
                        )}
                        <form onSubmit={handleLogin} className={styles.form}>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="login-username">Username</label>
                            <InputText
                              id="login-username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              autoComplete="username"
                              className={styles.input}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="login-password">Password</label>
                            <Password
                              id="login-password"
                              name="password"
                              value={formData.password}
                              onChange={(e) =>
                                handlePasswordChange(
                                  { value: e.target.value },
                                  "password",
                                )
                              }
                              required
                              autoComplete="current-password"
                              feedback={false}
                              toggleMask
                              className={styles.passwordInput}
                              inputStyle={{ width: "100%" }}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setForgotPasswordMode(true);
                              setError("");
                            }}
                            className={styles.forgotPasswordButton}
                            variant="text"
                            label="Forgot password?"
                          />
                          <Button
                            type="submit"
                            label={loading ? "Signing in..." : "Sign In"}
                            disabled={loading}
                            loading={loading}
                            className={styles.submitButton}
                          />
                        </form>
                      </div>
                    ) : (
                      <div role="tabpanel">
                        <h2 className={styles.title}>Sign Up</h2>
                        {error && (
                          <Message
                            severity="error"
                            text={error}
                            className={styles.errorMessage}
                          />
                        )}
                        <form onSubmit={handleRegister} className={styles.form}>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="name">Name</label>
                            <InputText
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className={styles.input}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="register-email">Email</label>
                            <InputText
                              id="register-email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              autoComplete="email"
                              className={styles.input}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="register-username">Username</label>
                            <InputText
                              id="register-username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              className={styles.input}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="register-password">Password</label>
                            <Password
                              id="register-password"
                              name="password"
                              value={formData.password}
                              onChange={(e) =>
                                handlePasswordChange(
                                  { value: e.target.value },
                                  "password",
                                )
                              }
                              required
                              feedback={false}
                              toggleMask
                              className={styles.passwordInput}
                              inputStyle={{ width: "100%" }}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <Password
                              id="confirm-password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  { value: e.target.value },
                                  "confirmPassword",
                                )
                              }
                              required
                              feedback={false}
                              toggleMask
                              className={styles.passwordInput}
                              inputStyle={{ width: "100%" }}
                            />
                          </div>
                          <div className={`p-field ${styles.pField}`}>
                            <label htmlFor="inviteCode">Invite Code</label>
                            <InputText
                              id="inviteCode"
                              name="inviteCode"
                              value={formData.inviteCode}
                              onChange={handleChange}
                              required
                              className={styles.input}
                            />
                          </div>
                          <Button
                            type="submit"
                            label={loading ? "Signing up..." : "Sign Up"}
                            disabled={loading}
                            loading={loading}
                            className={styles.submitButton}
                          />
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
