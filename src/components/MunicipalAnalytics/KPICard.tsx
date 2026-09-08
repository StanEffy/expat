import React from 'react';
import styles from './KPICard.module.scss';

interface Props {
  icon: string;
  color: 'cyan' | 'blue' | 'green' | 'purple' | 'amber';
  label: string;
  value: string | number;
  trend?: string;
  subtext?: string;
}

export const KPICard: React.FC<Props> = ({
  icon,
  color,
  label,
  value,
  trend,
  subtext,
}) => {
  return (
    <div className={styles.card}>
      <div className={`${styles.iconWrapper} ${styles[color]}`}>
        <i className={icon} />
      </div>
      <div className={styles.infoArea}>
        <p className={styles.label}>{label}</p>
        <div className={styles.valueRow}>
          <h3 className={styles.value}>{value}</h3>
          {trend && (
            <span className={`${styles.badgeTrend} ${styles.positive}`}>
              <i className="pi pi-arrow-up" style={{ fontSize: '0.65rem' }} />
              {trend}
            </span>
          )}
        </div>
        {subtext && <p className={styles.subtext}>{subtext}</p>}
      </div>
    </div>
  );
};

export default KPICard;
