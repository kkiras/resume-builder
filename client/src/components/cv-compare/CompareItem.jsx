import styles from "./CompareItem.module.css"
import Resume from "../cv-edit/resume/Resume"
import CVContext from "../cv-edit/CVContext"

export default function CompareItem({ data, bgColor }) {
    const stylesData = data?.styles || {}
    const headerDisplayType = styles.headerDisplayType || 'left'
    const textColor = stylesData.textColor || '#313131'
    const contentFontSize = stylesData.contentFontSize || '14px'
    const titleFontSize = stylesData.titleFontSize || '24px'
    const subTitleFontSize = stylesData.subTitleFontSize || '16px'
    const lineHeight = stylesData.lineHeight || 1.5
    const templateName = data?.templateName || 'Classic'

    return (
        <div 
            className={styles.container}
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
                    pageScrollHeight={'86vh'}
                    templateName={templateName

                    }
                />

                <div
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
                    <span>{data.name}</span>
                </div>
            </CVContext.Provider>
        </div>
    )
}
