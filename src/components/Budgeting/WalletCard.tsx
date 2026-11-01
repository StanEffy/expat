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
          {/* Lake contour lines, like a topographic map */}
          <g transform="translate(470, 120)" fill="none" stroke="var(--rule)" strokeWidth="1.5">
            <path d="M-150 0 C-150 -50 -60 -75 20 -62 C100 -50 150 -30 150 10 C150 55 70 75 0 66 C-70 58 -150 50 -150 0 Z" />
            <path d="M-110 2 C-110 -32 -45 -48 18 -40 C80 -32 112 -18 112 8 C112 38 55 50 0 44 C-55 38 -110 34 -110 2 Z" />
            <path d="M-70 4 C-70 -16 -25 -24 16 -20 C58 -16 74 -6 74 8 C74 24 36 28 0 25 C-36 22 -70 22 -70 4 Z" stroke="var(--accent)" strokeWidth="2" />
          </g>
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
