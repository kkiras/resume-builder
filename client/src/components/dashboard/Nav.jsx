import { useEffect, useRef, useState } from 'react'
import styles from './nav.module.css'
import NotificationModal from './NotificationModal'

export default function Nav({ onLogout }) {
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)
  const [selected, setSelected] = useState(null)
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const [notifications, setNotifications] = useState(() => ([
    { id: '1', title: 'Resume exported', body: 'Your resume has been successfully exported to PDF.', time: new Date().toLocaleString(), read: false },
    { id: '2', title: 'New template', body: 'A new modern template is now available to try.', time: new Date(Date.now() - 3600e3).toLocaleString(), read: false },
    { id: '3', title: 'Sync complete', body: 'All your resumes have been synced across devices.', time: new Date(Date.now() - 86400e3).toLocaleString(), read: true },
    { id: '4', title: 'Tips & tricks', body: 'Use section drag-and-drop to reorder items quickly.', time: new Date(Date.now() - 172800e3).toLocaleString(), read: true },
  ]))

  useEffect(() => {
    function handleDocClick(e) {
      const t = e.target
      const clickedMenu = menuRef.current && menuRef.current.contains(t)
      const clickedNotif = notifRef.current && notifRef.current.contains(t)
      if (!clickedMenu) setOpen(false)
      // Do not auto-close notification panel while modal is open
      if (!clickedNotif && !selected) {
        if (notifOpen) setHasNew(true) // show dot again when closing panel (for testing)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [notifOpen, selected])

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>Resumes</div>
      <div className={styles.right}>
        <div className={styles.rightGroup}>
          <div className={styles.bellWrap} ref={notifRef}>
            <button
              className={styles.bellBtn}
              aria-haspopup="listbox"
              aria-expanded={notifOpen}
              onClick={() => {
                setNotifOpen(v => {
                  const next = !v
                  if (next) setHasNew(false) // opening -> clear dot
                  else setHasNew(true) // closing -> show dot again (for testing)
                  return next
                })
              }}
            >
              <BellIcon size={24} />
              {hasNew && <span className={styles.bellDot} />}
            </button>

            {notifOpen && (
              <div className={styles.notifPanel} role="listbox">
                <div className={styles.notifHeader}>Notifications</div>
                <div className={styles.notifList}>
                  {notifications.map(n => (
                    <button
                      key={n.id}
                      className={styles.notifItem}
                      onClick={() => {
                        setSelected(n)
                        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
                      }}
                    >
                      <div className={n.read ? styles.notifTitle : styles.notifTitleUnread}>{n.title}</div>
                      <div className={styles.notifContent} title={n.body}>{n.body}</div>
                      <div className={styles.notifTime}>{n.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div ref={menuRef}>
            <button
              className={styles.profileBtn}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              <ProfileIcon size={28} />
            </button>

            {open && (
              <div className={styles.dropdown} role="menu">
                <button className={styles.item} role="menuitem" onClick={() => setOpen(false)}>Profile</button>
                <button className={styles.item} role="menuitem" onClick={() => setOpen(false)}>Settings</button>
                <button className={styles.item} role="menuitem" onClick={() => { setOpen(false); onLogout?.() }}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationModal open={!!selected} onClose={() => setSelected(null)} notification={selected} />
    </div>
  )
}

// Placeholder profile icon; can be replaced later
export function ProfileIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="9" r="4" fill="currentColor" opacity="0.9" />
      <path d="M4.5 19.5c1.8-3.2 5.1-5 7.5-5s5.7 1.8 7.5 5" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function BellIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" fill="currentColor"/>
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 1.5a1 1 0 0 0 .7 1.7h14.6a1 1 0 0 0 .7-1.7L18 16Z" fill="currentColor"/>
    </svg>
  )
}
