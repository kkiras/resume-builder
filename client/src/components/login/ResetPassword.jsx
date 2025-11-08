import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from 'rsuite'
import axios from 'axios'
import styles from './styles.module.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!uid || !token) {
      alert('Liên kết không hợp lệ hoặc thiếu thông tin.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      alert('Mật khẩu mới cần ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.')
      return
    }
    try {
      setLoading(true)
      const { data } = await axios.post('http://localhost:5000/api/auth/reset-password', {
        uid,
        token,
        newPassword,
      })
      alert(data?.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.')
      navigate('/login')
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể đặt lại mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3>Đặt lại mật khẩu</h3>
        <div className={styles.inputField}>
          <Input
            type="password"
            value={newPassword}
            onChange={(v) => setNewPassword(v)}
            placeholder="Mật khẩu mới"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(v) => setConfirmPassword(v)}
            placeholder="Xác nhận mật khẩu"
          />
        </div>
        <div className={styles.buttonField}>
          <Button loading={loading} onClick={handleReset}>Đặt lại mật khẩu</Button>
          <div className={styles.subButton}>
            <span>Quay lại</span>
            <span className={styles.subButtonContent} onClick={() => navigate('/login')}>Đăng nhập</span>
          </div>
        </div>
      </div>
    </div>
  )
}

