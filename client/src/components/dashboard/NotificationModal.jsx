import styles from './nav.module.css'

export default function NotificationModal({ open, onClose, notification }) {
  if (!open || !notification) return null
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>
        <div className={styles.modalHeader}>{notification.title}</div>
        <div className={styles.modalTime}>{notification.time}</div>
        <div className={styles.modalBody}>{notification.body}</div>
      </div>
    </div>
  )
}

