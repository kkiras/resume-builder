import { Outlet, useNavigate } from "react-router-dom"
import styles from "./styles.module.css"
import Nav from "./Nav"

export default function DashBoard() {
    const navigate = useNavigate()
    return (
        <div className={styles.layout}>
            <Nav onLogout={() => navigate('/login')} />
            <Outlet />
        </div>
    )
}
