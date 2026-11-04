import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SIDE_HOME, type Side } from "@/components/Sides/sides";
import styles from "./SideSwitch.module.scss";

const SIDES: { side: Side; name: string }[] = [
  { side: "expat", name: "EXPAT" },
  { side: "kipina", name: "KIPINÄ" },
];

/** Two-plate switch between the sides; the current one is the yellow plate. */
const SideSwitch = ({ side, className = "" }: { side: Side | null; className?: string }) => {
  const { t } = useTranslation();

  return (
    <nav className={`${styles.switch} ${className}`} aria-label={t("sides.switchLabel")}>
      {SIDES.map((item) => (
        <Link
          key={item.side}
          to={SIDE_HOME[item.side]}
          className={`${styles.plate} ${side === item.side ? styles.current : ""} notranslate`}
          aria-current={side === item.side ? "true" : undefined}
          translate="no"
          title={t(`sides.${item.side}.tagline`)}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default SideSwitch;
