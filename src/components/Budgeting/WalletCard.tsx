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
      <div className={styles.leftSection}>
        <div className={styles.tokenIconCircle}>
          <i className="pi pi-bolt" />
        </div>
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
  );
};

export default WalletCard;
