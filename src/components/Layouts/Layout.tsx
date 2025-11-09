import { ReactNode, useEffect, lazy, Suspense } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.scss";

const GlowingShapes = lazy(() => import("../Decorative/GlowingShapes"));

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Safari backdrop-filter polyfill detection
  useEffect(() => {
    const checkBackdropFilterSupport = () => {
      // Create a test element with backdrop-filter
      const testElement = document.createElement("div");
      testElement.style.position = "fixed";
      testElement.style.top = "-9999px";
      testElement.style.left = "-9999px";
      testElement.style.width = "1px";
      testElement.style.height = "1px";
      testElement.style.backdropFilter = "blur(1px)";
      // Set the prefixed property via setProperty to avoid TS errors
      testElement.style.setProperty("-webkit-backdrop-filter", "blur(1px)");
      document.body.appendChild(testElement);

      // Check if backdrop-filter is actually supported
      const computedStyle = window.getComputedStyle(testElement);
      const webkitValue = computedStyle.getPropertyValue(
        "-webkit-backdrop-filter",
      );
      const stdValue =
        (computedStyle as any).backdropFilter ||
        computedStyle.getPropertyValue("backdrop-filter");
      const hasBackdropFilter =
        (typeof stdValue === "string" &&
          stdValue.trim() !== "" &&
          stdValue.trim() !== "none") ||
        (typeof webkitValue === "string" &&
          webkitValue.trim() !== "" &&
          webkitValue.trim() !== "none") ||
        // Fallback check using CSS.supports if available
        (window.CSS &&
          window.CSS.supports &&
          (window.CSS.supports("-webkit-backdrop-filter", "blur(1px)") ||
            window.CSS.supports("backdrop-filter", "blur(1px)")));

      document.body.removeChild(testElement);

      // Add class to body if backdrop-filter is not supported
      if (!hasBackdropFilter) {
        document.body.classList.add("no-backdrop-filter");
      } else {
        document.body.classList.remove("no-backdrop-filter");
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkBackdropFilterSupport, 100);

    // Also check immediately and on events
    checkBackdropFilterSupport();

    // Recheck on resize/orientation change (for iOS Safari)
    window.addEventListener("resize", checkBackdropFilterSupport);
    window.addEventListener("orientationchange", checkBackdropFilterSupport);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkBackdropFilterSupport);
      window.removeEventListener(
        "orientationchange",
        checkBackdropFilterSupport,
      );
    };
  }, []);

  return (
    <div className={"wrapper"}>
      {/*<GeometricBackground />*/}
      <Suspense fallback={null}>
        <GlowingShapes />
      </Suspense>
      <Header />
      <main className={"main"}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
