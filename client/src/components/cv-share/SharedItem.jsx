import { useLocation } from "react-router-dom"
import styles from "./SharedItem.module.css"
import Resume from "../cv-edit/resume/Resume"
import CVContext from "../cv-edit/CVContext"
import { useEffect, useState } from "react"
import axios from "axios"
import API_BASE_URL from "../../utils/apiBase"

export default function SharedItem({ }) {
    const BG_ITEM_1 = 'var(--bg)'

    const [resumeData, setResumeData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const locationHook = useLocation();

    useEffect(() =>{
        const fetchShared = async () => {
            try {
                const params = new URLSearchParams(locationHook.search);
                const token = params.get('token');
                if (!token) {
                    setError('Missing share token');
                    return;
                }
                const res = await axios.get(`${API_BASE_URL}/api/shares/${encodeURIComponent(token)}`);
                const shared = res?.data?.resume;
                if (!shared) {
                    setError('Resume not found or private');
                    return;
                }
                setResumeData(shared);
            } catch (err) {
                console.error("Error fetching shared resume:", err);
                setError("This shared link is invalid or expired.");
            } finally {
                setLoading(false);
            }
        }

        fetchShared();
    }, [locationHook.search])

    return (
        <div className={styles.container}>
            <div className={styles.topbar}>
                {/* <button className={styles.backBtn} onClick={() => navigate('/dashboard/resumes')}>← Back</button> */}
                <h3>Shared CV</h3>
            </div>

            <div className={styles.compareGrid}>
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <h2>{error}</h2>
                ) : (
                    <Item data={resumeData} bgColor={BG_ITEM_1} />
                )}
            </div>
        </div>
    )



}

function Item ({ data, bgColor }) {
    const stylesData = data?.styles || {}
    const headerDisplayType = stylesData.headerDisplayType || 'left'
    const textColor = stylesData.textColor || '#313131'
    const contentFontSize = stylesData.contentFontSize || '14px'
    const titleFontSize = stylesData.titleFontSize || '24px'
    const subTitleFontSize = stylesData.subTitleFontSize || '16px'
    const lineHeight = stylesData.lineHeight || 1.5

    return (
        <div 
            className={styles.itemContainer}
            style={{
                backgroundColor: bgColor
            }}
        >
            <CVContext.Provider value={{ resumeData: data, setResumeData: () => {} }}>
                <Resume 
                    headerDisplayType={headerDisplayType}
                    textColor={textColor}
                    contentFontSize={contentFontSize}
                    titleFontSize={titleFontSize}
                    lineHeight={lineHeight}
                    subTitleFontSize={subTitleFontSize}
                    comparePadding={'16px 0px'}
                    compareMargin={0}
                    isBgForPageScroll={false}
                    pageScrollHeight={'92vh'}
                />

                {/* <div
                    style={{
                        position: 'absolute',
                        zIndex: 100000000,
                        backgroundColor: '#31313170',
                        bottom: '0px',
                        left: '50%',
                        transform: 'translate(-50%, -0%)',
                        padding: '12px 48px 16px 48px',
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px',
                        color: '#edededff'
                    }}
                >
                    <span>{data?.name}</span>
                </div> */}
            </CVContext.Provider>
        </div>
    )
}
