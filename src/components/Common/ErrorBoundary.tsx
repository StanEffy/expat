import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const message = error?.message || String(error);
    const isChunkError =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('Expected a JavaScript module script') ||
      error?.name === 'ChunkLoadError';

    return { hasError: true, isChunkError, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Auto-reload once if it's a chunk error from a newly deployed version
    if (this.state.isChunkError) {
      const alreadyReloaded = window.sessionStorage.getItem('chunk_reload_attempted') === 'true';
      if (!alreadyReloaded) {
        window.sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.sessionStorage.removeItem('chunk_reload_attempted');
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { isChunkError } = this.state;

      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconCircle}>
              <i className={isChunkError ? 'pi pi-cloud-download' : 'pi pi-exclamation-triangle'} />
            </div>
            <h2>{isChunkError ? 'Доступно обновление' : 'Что-то пошло не так'}</h2>
            <p>
              {isChunkError
                ? 'Была опубликована новая версия приложения. Пожалуйста, обновите страницу, чтобы загрузить актуальную версию.'
                : 'Произошла непредвиденная ошибка при загрузке страницы. Попробуйте обновить страницу.'}
            </p>
            <div className={styles.actions}>
              <Button
                variant="filled"
                label="Обновить страницу"
                icon="pi pi-refresh"
                onClick={this.handleReload}
              />
              {!isChunkError && (
                <Button
                  variant="outlined"
                  label="На главную"
                  icon="pi pi-home"
                  onClick={this.handleGoHome}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
