import styles from "./ErrorBanner.module.css"

interface ErrorBannerProps {
  error: string
  clearError: () => void
}

export const ErrorBanner = ({ error, clearError }: ErrorBannerProps) => {
  return (
    <>
      <div className={styles.errorBanner}>
        <span>{error}</span>
        <button
          className={styles.errorClose}
          onClick={clearError}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

    </>
  )
}

