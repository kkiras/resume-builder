import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import styles from './nav.module.css'
import NotificationModal from './NotificationModal'

export default function Nav({ onLogout }) {
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)
  const [selected, setSelected] = useState(null)
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const titleMap = { profile: 'Profile', resumes: 'Resumes', compare: 'Compare' }
  const pageKey = location.pathname.replace(/\/+$/, '').split('/').pop()
  const pageTitle = titleMap[pageKey] || 'Dashboard'
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

  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    // Ensure axios has auth header if token exists
    const token = localStorage.getItem('token')
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Prefill from localStorage (e.g., after Google login)
    try {
      const cached = JSON.parse(localStorage.getItem('user') || 'null')
      if (cached?.avatar) setAvatarUrl(cached.avatar)
    } catch {}

    // Fetch latest from server
    ;(async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/me')
        const url = data?.user?.avatar || ''
        if (url) setAvatarUrl(url)
      } catch {}
    })()
    // Listen for profile updates broadcast from Profile.jsx
    function onUserUpdated(e) {
      const next = e?.detail?.avatar || ''
      setAvatarUrl(next)
    }
    window.addEventListener('user:updated', onUserUpdated)
    return () => window.removeEventListener('user:updated', onUserUpdated)
  }, [])

  return (
    <div className={styles.topbar}>
      <button className={styles.leftLink} onClick={() => navigate('/dashboard/resumes')}>
        Resumes
      </button>
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
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <ProfileIcon size={24} />
              )}
            </button>

            {open && (
              <div className={styles.dropdown} role="menu">
                <button
                  className={styles.item}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false)
                    navigate('/dashboard/profile')
                  }}
                >
                  Profile
                </button>
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
