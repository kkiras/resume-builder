import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import styles from './styles.module.css'
import { Button, Modal } from 'rsuite'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../../utils/apiBase'
import { isGuestSession } from '../../../utils/session'

export default function Profile() {
  const navigate = useNavigate()
  const isGuest = useMemo(() => isGuestSession(), [])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
  })
  const [loading, setLoading] = useState(true)
  const [isGoogle, setIsGoogle] = useState(false)
  const fileInputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (isGuest) {
      setLoading(false)
      setIsGoogle(false)
      return
    }
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    ;(async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/me`)
        const u = data?.user || {}
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          location: u.location || '',
          avatar: u.avatar || '',
        })
        setIsGoogle(!!u.isGoogle)
      } catch (err) {
        // If unauthorized or empty, set empty form
        setForm({ name: '', email: '', phone: '', location: '', avatar: '' })
        setIsGoogle(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [isGuest])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function triggerAvatarSelect() {
    if (isGoogle || isGuest) return
    fileInputRef.current?.click()
  }

  function handleAvatarChange(e) {
    const file = e?.target?.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, avatar: objectUrl }))
  }

  async function objectUrlToDataUrl(objectUrl) {
    const res = await fetch(objectUrl)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async function handleSave(e) {
    e?.preventDefault?.()
    if (isGuest) {
      alert('Guest mode cannot update profile.')
      return
    }
    try {
      let finalAvatar = form.avatar || ''
      const isBlob = typeof finalAvatar === 'string' && finalAvatar.startsWith('blob:')
      const isData = typeof finalAvatar === 'string' && finalAvatar.startsWith('data:')

      if (isBlob) {
        const dataUrl = await objectUrlToDataUrl(finalAvatar)
        const uploadRes = await axios.post(`${API_BASE_URL}/api/users/upload-avatar`, { image: dataUrl })
        finalAvatar = uploadRes?.data?.url || ''
      } else if (isData) {
        const uploadRes = await axios.post(`${API_BASE_URL}/api/users/upload-avatar`, { image: finalAvatar })
        finalAvatar = uploadRes?.data?.url || ''
      }

      const payload = {
        name: form.name || '',
        phone: form.phone || '',
        location: form.location || '',
        avatar: finalAvatar || '',
      }
      const { data } = await axios.put(`${API_BASE_URL}/api/users/me`, payload)
      const u = data?.user || {}
      setForm({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        location: u.location || '',
        avatar: u.avatar || '',
      })
      // Persist and broadcast to update navbar/avatar, etc.
      try {
        const nextUser = {
          email: u.email || '',
          name: u.name || '',
          avatar: u.avatar || '',
          phone: u.phone || '',
          location: u.location || '',
        }
        localStorage.setItem('user', JSON.stringify(nextUser))
        window.dispatchEvent(new CustomEvent('user:updated', { detail: nextUser }))
      } catch {}
      alert('Saved profile successfully!')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      alert(msg)
    }
  }

  if (loading) return <div className={styles.container}><p>Loading...</p></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Personal Information</h2>
        <p className={styles.subtitle}>Update your personal details and contact information</p>
        <div>
          <Button color="red" appearance="primary" onClick={handleOpen} disabled={isGuest}>
            Delete My Account & Data
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.avatarColumn}>
          {form.avatar ? (
            <div className={styles.avatar} aria-label="profile photo">
              {/* Use background image via inline style to keep existing styles */}
              <img src={form.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          ) : (
            <div className={styles.avatar} aria-label="profile photo placeholder" />
          )}
          <div className={styles.avatarActions}>
            <button className={styles.photoBtn} type="button" onClick={triggerAvatarSelect} disabled={isGoogle || isGuest}>
              {isGoogle ? 'Managed by Google' : isGuest ? 'Guest mode' : 'Change Photo'}
            </button>
            <div className={styles.photoHint}>JPG, PNG or GIF. Max size 2MB.</div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              className={styles.input}
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              readOnly
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              className={styles.input}
              value={form.phone}
              onChange={handleChange}
              placeholder="(+84) 090-xxx-xxxx"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              className={styles.input}
              value={form.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={isGuest}>Save Changes</button>
            <button type="button" className={styles.cancelBtn} onClick={() => window.location.reload()}>Cancel</button>
          </div>
        </form>
      </div>

      <Modal backdrop="static" role="alertdialog" open={open && !isGuest} onClose={handleClose} size="xs">
        <Modal.Body>
          {/* Icon intentionally omitted to avoid extra dependency */}
          This will permanently delete your account and all resumes. This action cannot be undone. Are you sure you want to proceed?
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              try {
                await axios.delete(`${API_BASE_URL}/api/users/me`)
                // Clear local session
                try {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  localStorage.removeItem('resumeEditing')
                  localStorage.removeItem('compareSelection')
                } catch {}
                handleClose()
                navigate('/login')
              } catch (err) {
                alert(err?.response?.data?.message || 'Failed to delete account')
              }
            }}
            appearance="primary"
            color="red"
          >
            Delete
          </Button>
          <Button onClick={handleClose} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
