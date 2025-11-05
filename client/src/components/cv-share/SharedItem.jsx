import { useLocation, useNavigate } from "react-router-dom"
import styles from "./SharedItem.module.css"
import Resume from "../cv-edit/resume/Resume"
import CVContext from "../cv-edit/CVContext"
import { useEffect, useState } from "react"
import axios from "axios"

export default function SharedItem({ }) {
    const BG_ITEM_1 = 'var(--bg)'
    const navigate = useNavigate()

    const [resumeData, setResumeData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const isPublic = true

    useEffect(() =>{
        const getResume = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/resumeRoutes/get-resume`);
                setResumeData(res.data.resume)
                console.log(res.data.resume)
            } catch (err) {
                console.error("Error fetching resume:", err);
                setError("Failed to load resume");
            }
            // } finally {
            //     setLoading(false);
            // }
        }

        getResume();
    },[])

    return (
        <div className={styles.container}>
            <div className={styles.topbar}>
                {/* <button className={styles.backBtn} onClick={() => navigate('/dashboard/resumes')}>← Back</button> */}
                <h3>Shared CV</h3>
            </div>

            <div className={styles.compareGrid}>
                {isPublic ? (
                    <Item data={resumeData} bgColor={BG_ITEM_1} />
                ) : (
                    <h2>Sorry, this CV has set to private.</h2>
                )}

            </div>
        </div>
    )



}

function Item ({ data, bgColor }) {
    const stylesData = data?.styles || {}
    const headerDisplayType = 'left'
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