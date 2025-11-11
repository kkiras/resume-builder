import { useLocation, useNavigate } from "react-router-dom"
import CompareItem from "./CompareItem"
import styles from "./ResumeCompare.module.css"

export default function ResumeCompare() {
    const BG_ITEM_1 = 'var(--bg)'
    const BG_ITEM_2 = 'color-mix(in oklab, var(--muted) 30%, transparent)'
    const navigate = useNavigate()
    const location = useLocation()
    const fromState = location?.state?.resumes || []
    let [resume1, resume2] = fromState
    if (!resume1 || !resume2) {
        try {
            const stored = JSON.parse(localStorage.getItem('compareSelection') || '[]')
            resume1 = stored[0]
            resume2 = stored[1]
        } catch {}
    }

    return (
        <div className={styles.container}>
            <div className={styles.topbar}>
                <button className={styles.backBtn} onClick={() => navigate('/dashboard/resumes')}>← Back</button>
                <h3>Compare Resumes</h3>
                <span />
            </div>

            {(!resume1 || !resume2) ? (
                <div className={styles.empty}>No selection found. Please go back and pick two resumes.</div>
            ) : (
                <div className={styles.compareGrid}>
                    <CompareItem data={resume1} bgColor={BG_ITEM_1} />
                    <CompareItem data={resume2} bgColor={BG_ITEM_2} />
                </div>
            )}
        </div>
    )
}
