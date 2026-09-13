import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import styles from './WalletCard.module.scss';

interface Props {
  totalTokens: number;
  remainingTokens: number;
  usedTokens: number;
  onReset: () => void;
}

export const WalletCard: React.FC<Props> = ({
  totalTokens,
  remainingTokens,
  usedTokens,
  onReset,
}) => {
  const { t } = useTranslation('budgeting');

  const pips = Array.from({ length: totalTokens }, (_, i) => i < remainingTokens);

  return (
    <div className={styles.walletCard}>
      {/* Abstract decorative background */}
      <div className={styles.decorativeBackground} aria-hidden="true">
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <svg
          className={styles.abstractSvg}
          viewBox="0 0 600 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="wcard_orb_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cf5baf" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#9333ea" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="wcard_line_grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a0297f" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#cf5baf" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="wcard_mesh_radial" cx="80%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.07" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft mesh background */}
          <rect width="100%" height="100%" fill="url(#wcard_mesh_radial)" />

          {/* Abstract geometric orbital ellipses */}
          <g transform="translate(480, 110)">
            <ellipse
              cx="0"
              cy="0"
              rx="145"
              ry="62"
              stroke="url(#wcard_line_grad)"
              strokeWidth="1.2"
              transform="rotate(-25)"
              strokeDasharray="6 4"
              opacity="0.6"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="110"
              ry="48"
              stroke="url(#wcard_orb_grad)"
              strokeWidth="1.5"
              transform="rotate(-10)"
              opacity="0.75"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="78"
              ry="32"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="3 3"
              transform="rotate(15)"
              opacity="0.45"
            />

            {/* Decorative orbital nodes */}
            <circle cx="78" cy="-28" r="3" fill="#fbbf24" opacity="0.85">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="-95" cy="18" r="2.5" fill="#cf5baf" opacity="0.75">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="38" r="2" fill="#ffffff" opacity="0.65" />
          </g>

          {/* Flowing abstract wave curves */}
          <path
            d="M160 240 C 260 195, 340 215, 420 175 C 490 140, 550 160, 620 120"
            stroke="url(#wcard_line_grad)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M200 240 C 290 210, 370 225, 450 190 C 510 160, 570 175, 640 135"
            stroke="url(#wcard_orb_grad)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
            opacity="0.25"
          />

          {/* Fine geometric coordinate grid lines in corner */}
          <g opacity="0.14" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75">
            <line x1="420" y1="0" x2="420" y2="240" strokeDasharray="2 4" />
            <line x1="480" y1="0" x2="480" y2="240" strokeDasharray="2 4" />
            <line x1="540" y1="0" x2="540" y2="240" strokeDasharray="2 4" />
            <line x1="380" y1="60" x2="600" y2="60" strokeDasharray="2 4" />
            <line x1="380" y1="120" x2="600" y2="120" strokeDasharray="2 4" />
            <line x1="380" y1="180" x2="600" y2="180" strokeDasharray="2 4" />
          </g>

          {/* Abstract diamond & sparkle motifs */}
          <path d="M530 40 L533 48 L541 51 L533 54 L530 62 L527 54 L519 51 L527 48 Z" fill="#cf5baf" opacity="0.4" />
          <path d="M350 28 L352 33 L357 35 L352 37 L350 42 L348 37 L343 35 L348 33 Z" fill="#fbbf24" opacity="0.35" />
          <path d="M240 60 L241.5 64 L245.5 65.5 L241.5 67 L240 71 L238.5 67 L234.5 65.5 L238.5 64 Z" fill="#ffffff" opacity="0.3" />
        </svg>
      </div>

      {/* Main card content layer */}
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.titleArea}>
            <h3>{t('wallet.title', 'Your Resident Voting Tokens')}</h3>
            <p>{t('wallet.budget_rule', 'Each registered resident receives 5 voting tokens to allocate toward community proposals.')}</p>
            <div className={styles.tokenIndicators}>
              {pips.map((isActive, idx) => (
                <div
                  key={idx}
                  className={`${styles.tokenPip} ${isActive ? styles.active : styles.spent}`}
                  title={isActive ? 'Token available' : 'Token spent'}
                >
                  <i className={isActive ? 'pi pi-check' : 'pi pi-circle'} style={{ fontSize: '0.65rem' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.statBlock}>
            <div className={styles.statLabel}>{t('wallet.remaining', 'Tokens Remaining')}</div>
            <div className={`${styles.statValue} ${styles.gold}`}>{remainingTokens} / {totalTokens}</div>
          </div>

          <div className={styles.statBlock}>
            <div className={styles.statLabel}>{t('wallet.allocated', 'Votes Cast')}</div>
            <div className={styles.statValue}>{usedTokens}</div>
          </div>

          {usedTokens > 0 && (
            <div className={styles.actionArea}>
              <Button
                label={t('wallet.reset_btn', 'Reset My Votes')}
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                size="small"
                onClick={onReset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
