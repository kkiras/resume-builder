import { Button, Input } from 'rsuite'
import styles from './styles.module.css'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import GoogleOneTapButton from './GoogleOneTapButton'
import API_BASE_URL from '../../utils/apiBase'

export default function Login() {
    const [state, setState] = useState('Login')
    const [loginInfor, setLoginInfor] = useState({
        email: '',
        password: ''
    });

    const [signUpInfor, setSignUpInfor] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const [token, setToken] = useState('')
    const [forgotEmail, setForgotEmail] = useState('')

    const handleSignUp = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, signUpInfor);
            if (res?.data?.token) {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            }
            alert(res?.data?.message || 'User registered successfully');
            navigate('/dashboard/resumes')
        } catch (err) {
            alert(err?.response?.data?.message || 'Registration failed');
        }
    };

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, loginInfor);
            setToken(res.data.token);
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            alert('Login success')
            navigate('/dashboard/resumes')
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    const handleGuest = async () => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/guest`);
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            alert('Guest mode enabled');
            navigate('/dashboard/resumes');
        } catch (err) {
            alert(err?.response?.data?.message || 'Unable to start guest session');
        }
    }

    const handleForgotPassword = async () => {
        try {
            const email = (forgotEmail || loginInfor.email || '').trim();
            if (!email) {
                alert('Vui lòng nhập email');
                return;
            }
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
            alert(data?.message || 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.');
            setState('Login');
        } catch (err) {
            // Blind response on error as well
            alert('Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.');
            setState('Login');
        }
    }

    return (
        <div className={styles.container}>
            {state === 'Login' ? (
                <div className={styles.card}>
                    <h3>Login</h3>

                    <div className={styles.inputField}>
                        <Input 
                            value={loginInfor.email}
                            onChange={(value) => 
                                setLoginInfor({
                                    ...loginInfor,
                                    email: value,
                                })
                            }
                            placeholder='E-mail' 
                        />

                        <Input 
                            value={loginInfor.password}
                            onChange={(value) => 
                                setLoginInfor({
                                    ...loginInfor,
                                    password: value,
                                })
                            }
                            placeholder='Password' 
                        />
                    </div>

                    <div className={styles.buttonField} >
                        <Button onClick={handleLogin}>Login</Button>
                        <GoogleOneTapButton />
                        <div className={styles.subButton} >
                            <span>Don't have an account?</span>
                            <span
                                className={styles.subButtonContent}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setState('Sign Up')
                                }} 
                            >
                                Sign up
                            </span>
                        </div>
                        <div className={styles.subButton}>
                            <span>Or enter</span>
                            <span className={styles.subButtonContent} onClick={handleGuest}>Guest mode</span>
                        </div>
                        <div className={styles.subButton}>
                            <span>Quên mật khẩu?</span>
                            <span
                                className={styles.subButtonContent}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setState('Forgot')}
                            >
                                Đặt lại mật khẩu
                            </span>
                        </div>
                        
                    </div>
                </div>
            ) : state === 'Sign Up' ? (
                <div className={styles.card}>
                    <h3>Sign Up</h3>

                    <div className={styles.inputField}>
                        <Input 
                            value={signUpInfor.email}
                            onChange={(value) => 
                                setSignUpInfor({
                                    ...signUpInfor,
                                    email: value,
                                })
                            }
                            placeholder='E-mail' 
                        />

                        <Input 
                            value={signUpInfor.password}
                            onChange={(value) => 
                                setSignUpInfor({
                                    ...signUpInfor,
                                    password: value,
                                })
                            }
                            placeholder='Password' 
                        />
                    </div>

                    <div className={styles.buttonField} >
                        <Button onClick={handleSignUp}>Sign Up</Button>
                        <div className={styles.subButton} >
                            <span>Already have an account?</span>
                            <span
                                className={styles.subButtonContent}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {                               
                                    setState('Login')
                                }} 
                            >
                                Login
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.card}>
                    <h3>Quên mật khẩu</h3>
                    <div className={styles.inputField}>
                        <Input 
                            value={forgotEmail}
                            onChange={(value) => setForgotEmail(value)}
                            placeholder='Nhập email đã đăng ký' 
                        />
                    </div>
                    <div className={styles.buttonField}>
                        <Button onClick={handleForgotPassword}>Gửi hướng dẫn</Button>
                        <div className={styles.subButton}>
                            <span>Nhớ mật khẩu rồi?</span>
                            <span 
                                className={styles.subButtonContent}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setState('Login')}
                            >
                                Quay lại đăng nhập
                            </span>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    )
}
