import { Outlet, useNavigate } from "react-router-dom"
import styles from "./styles.module.css"
import Nav from "./Nav"

export default function DashBoard() {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('resumeEditing');
        localStorage.removeItem('compareSelection');
        sessionStorage.clear();
        window.dispatchEvent(new CustomEvent('user:updated', { detail: null }));
        navigate('/login');
    }
    return (
        <div className={styles.layout}>
            <Nav onLogout={() => handleLogout()} />
            <Outlet />
        </div>
    )
}
