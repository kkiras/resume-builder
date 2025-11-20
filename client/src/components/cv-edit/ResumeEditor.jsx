import Card from "../ui/Card"
import Resume from "./resume/Resume"
import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import SectionDetail from "./SectionDetail"
import SectionList from "./list/SectionList"
import CVContext from "./CVContext"
import LeftPanel from "./panel/LeftPanel"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { Button, Toggle } from "rsuite"
import { exportElementToPdf } from "../../utils/exportToPdf"
import BasicsItem from "./basics/BasicsItem"
import SkillItem from "./skills/SkillItem"
import styles from "./styles.module.css"
import { exportModernToPdf, printModernInBrowser } from "../../utils/exportModernToPdf";
import API_BASE_URL from "../../utils/apiBase";
import { createGuestResumeId, isGuestSession, upsertGuestResume } from "../../utils/session";

function formatTemplateName(value) {
    if (typeof value !== 'string') return 'Classic';
    const trimmed = value.trim();
    if (!trimmed) return 'Classic';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export default function ResumeEditor() {    
    const navigate = useNavigate();
    const [resumeData, setResumeData] = useState(() => {
        const stored = localStorage.getItem("resumeEditing");
        console.log(stored)
        return stored ? JSON.parse(stored) : { sections: [] };
    });
    const [selectedSection, setSelectedSection] = useState()
    const resumeRef = useRef(null);
    const [headerDisplayType, setHeaderDisplayType] = useState('left')

    const sections = useMemo(() => (
        resumeData?.sections?.map(s => ({ id: s.id, title: s.title })) ?? []
    ), [resumeData]);
    const isGuest = useMemo(() => isGuestSession(), [])
    const templateName = useMemo(() => formatTemplateName(resumeData?.template), [resumeData?.template])

    const [ textColor, setTextColor ] = useState('#313131');
    const [ contentFontSize, setContentFontSize ] = useState('14px');
    const [ titleFontSize, setTitleFontSize ] = useState('24px');
    const [ subTitleFontSize, setSubTitleFontSize ] = useState('16px');
    const [ lineHeight, setLineHeight ] = useState(1.5)
    const [shareOpen, setShareOpen] = useState(false)
    const [isPublic, setIsPublic] = useState(false)
    const [shareLink, setShareLink] = useState('')
    const [isTranslating, setIsTranslating] = useState(false)

    // const skills = resumeData?.sections.find(section => section.id === 'skills').items

    

    useEffect(() => {
        localStorage.setItem("resumeEditing", JSON.stringify(resumeData));
    }, [resumeData]);

    // Sync style states from resumeData.styles on load/change
    useEffect(() => {
        const s = resumeData?.styles;
        if (!s) return;
        if (typeof s.textColor === 'string') setTextColor(s.textColor);
        if (typeof s.contentFontSize === 'string') setContentFontSize(s.contentFontSize);
        if (typeof s.titleFontSize === 'string') setTitleFontSize(s.titleFontSize);
        if (typeof s.subTitleFontSize === 'string') setSubTitleFontSize(s.subTitleFontSize);
        if (typeof s.lineHeight === 'number') setLineHeight(s.lineHeight);
        if (typeof s.headerDisplayType === 'string') setHeaderDisplayType(s.headerDisplayType);
    }, [resumeData?.styles]);

    
    useEffect(() => {
        console.log('Resume Data:', resumeData)
    },[resumeData])

    useEffect(() => {
        console.log('Selected Section:', selectedSection)
    }, [selectedSection])

    useEffect(() => {
        console.log('Header display type:', headerDisplayType)
    }, [headerDisplayType])

        //Chuyển thành dataURL để gửi đến server vì k thể gửi trực tiếp blobURL đến server
        //blobURL - file tạm thời trong trình duyệt, k lưu trữ lâu dài
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

    const handleSave = async () => {
        try {
            if (!isGuest) {
                await ensureAuthHeader()
            }
            let avatarSrc = resumeData?.basics?.avatar || ''
            let finalAvatarUrl = avatarSrc

            const isBlob = typeof avatarSrc === 'string' && avatarSrc.startsWith('blob:')
            const isData = typeof avatarSrc === 'string' && avatarSrc.startsWith('data:')

            if (isBlob) {
                const dataUrl = await objectUrlToDataUrl(avatarSrc)
                const uploadRes = await axios.post(`${API_BASE_URL}/api/resumeRoutes/upload-avatar`, { image: dataUrl })
                finalAvatarUrl = uploadRes?.data?.url || ''
            } else if (isData) {
                const uploadRes = await axios.post(`${API_BASE_URL}/api/resumeRoutes/upload-avatar`, { image: avatarSrc })
                finalAvatarUrl = uploadRes?.data?.url || ''
            }

            // Attach userId when creating a new resume (server requires it)
            let userId = undefined;
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = jwtDecode(token);
                    if (payload?.id) userId = payload.id;
                }
            } catch {}

            const resumeToSave = {
                ...resumeData,
                basics: {
                    ...resumeData?.basics,
                    avatar: finalAvatarUrl,
                },
                // persist current UI style settings as part of resume data
                styles: {
                    textColor,
                    contentFontSize,
                    titleFontSize,
                    subTitleFontSize,
                    lineHeight,
                    headerDisplayType,
                },
                updatedAt: Date.now(),
                // Only needed for new resumes
                ...(resumeData?._id ? {} : (userId ? { userId } : {})),
            }

            if (isGuest) {
                const saved = upsertGuestResume(resumeToSave._id ? resumeToSave : { ...resumeToSave, _id: resumeData?._id || createGuestResumeId() });
                if (saved) {
                    setResumeData(saved)
                    localStorage.setItem("resumeEditing", JSON.stringify(saved))
                }
                alert('Saved locally in guest mode.')
                return;
            }

            const res = await axios.post(`${API_BASE_URL}/api/resumeRoutes/save-resume`, resumeToSave)
            if (res?.data?.resume) {
                setResumeData(res.data.resume)
                localStorage.setItem("resumeEditing", JSON.stringify(res.data.resume))
            }
            alert('Save successfully!')
        } catch (err) {
            const msg = err?.response?.data?.message || err.message
            alert(msg)
        }
    }

    async function ensureAuthHeader() {
        const token = localStorage.getItem('token')
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    async function handleToggleShare(checked) {
        try {
            if (isGuest) {
                alert('Vui lòng đăng ký để chia sẻ resume.');
                return;
            }
            if (!resumeData?._id) {
                alert('Please save resume before sharing');
                return;
            }
            await ensureAuthHeader()

            if (checked) {
                await axios.patch(`${API_BASE_URL}/api/resumes/${resumeData._id}/visibility`, { visibility: 'public' })
                const { data } = await axios.post(`${API_BASE_URL}/api/resumes/${resumeData._id}/share/enable`)
                const token = data?.token
                if (token) {
                    const url = `${window.location.origin}/shared?token=${token}`
                    setShareLink(url)
                }
                setIsPublic(true)
            } else {
                await axios.patch(`${API_BASE_URL}/api/resumes/${resumeData._id}/visibility`, { visibility: 'private' })
                setIsPublic(false)
                setShareLink('')
            }
        } catch (err) {
            alert(err?.response?.data?.message || err.message)
        }
    }

    async function handleCopyLink() {
        try {
            if (!shareLink) return;
            await navigator.clipboard.writeText(shareLink)
            alert('Copied!')
        } catch (e) {
            alert('Copy failed')
        }
    }

    async function handleTranslateToEnglish() {
        try {
            setIsTranslating(true)
            const { data } = await axios.post(`${API_BASE_URL}/api/llm/translate`, {
                resume: resumeData,
                targetLang: 'Vietnamese',
            })
            if (data?.resume) {
                setResumeData(data.resume)
                localStorage.setItem("resumeEditing", JSON.stringify(data.resume))
            }
        } catch (err) {
            const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message
            alert(msg || 'Translate failed')
        } finally {
            setIsTranslating(false)
        }
    }

    const handlePrint =  () => {
        exportElementToPdf(resumeRef.current, {
            fileName: "test-demo.pdf",
            orientation: "p",
            format: "a4",
            scale: 2,
        })

        // exportModernToPdf(resumeRef.current, { fileName: "VinhTran_Resume.pdf", scale: 2 });
    }

    function handleAddNewSection() {
        const ts = Date.now();
        const newSection = {
            id: `section-${ts}`,
            kind: "generic",
            title: "New Section", // 👈 Tiêu đề mặc định
            items: [
            {
                id: `item-${ts}`,
                name: "",
                role: "",
                time: "",
                detail: "",
            },
            ],
        };

        // Cập nhật vào resumeData
        setResumeData((prev) => {
            const next = { ...prev, sections: [...prev.sections, newSection] };
            localStorage.setItem("resumeEditing", JSON.stringify(next));
            return next;
        });

        // Tự động chọn section mới
        setSelectedSection({ id: newSection.id, title: newSection.title });
    }

    if (!resumeData) return <p>Loading...</p>;

    return (
        resumeData && (
            <CVContext.Provider value={{ resumeData, setResumeData }}>
                <div className="container">

                    <div
                        className={styles.header}
                    >
                        <Button onClick={() => navigate('/dashboard/resumes')}>Back</Button>
                        <div className="cv-btn-group" style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }} >
                            <Button onClick={handleSave}>Save</Button>
                            <Button onClick={handlePrint}>Print</Button>
                            <Button onClick={() => setShareOpen(v => !v)}>Share CV</Button>
                            <Button loading={isTranslating} disabled={isTranslating} onClick={handleTranslateToEnglish}>
                                {isTranslating ? "Translating..." : "Translate to English"}
                            </Button>

                            {shareOpen && (
                                <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: 12, minWidth: 300, zIndex: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        <span>Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{isPublic ? 'Public' : 'Private'}</span>
                                            <Toggle checked={isPublic} onChange={(checked) => handleToggleShare(checked)} />
                                        </div>
                                    </div>

                                    {isPublic && (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 }}>Share Link</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <input className="rs-input" readOnly value={shareLink} style={{ flex: 1 }} />
                                                <Button onClick={handleCopyLink}>Copy</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div id="edit-container">
                            <LeftPanel 
                                textColor={textColor}
                                setTextColor={setTextColor}
                                contentFontSize={contentFontSize}
                                setContentFontSize={setContentFontSize}
                                titleFontSize={titleFontSize}
                                setTitleFontSize={setTitleFontSize}
                                lineHeight={lineHeight}
                                setLineHeight={setLineHeight}
                                subTitleFontSize={subTitleFontSize}
                                setSubTitleFontSize={setSubTitleFontSize}
                            />

                        

                        <div id="split-layout">
                            {/* <div id="editor-container">
                                
                            </div> */}
                            
                            {/* <StickyBox offsetTop={20} offsetBottom={20} className="editor-field">
                                
                            </StickyBox> */}

                            <div id="editor-field">
                                <div>
                                    <Card >
                                        <h3>Arrange Section</h3>
                                        <p>Drag & drop to change section position</p>

                                        <SectionList
                                            selectedSection={selectedSection}
                                            setSelectedSection={setSelectedSection}
                                            initialItems={sections}
                                            // setOrder={setOrder}
                                            
                                        />
                                        <Button 
                                            className={styles.btnNewItem}
                                            onClick={handleAddNewSection}
                                        >
                                            <AddIcon size={20} />
                                            Create new item
                                        </Button>
                                    </Card>

                                    {selectedSection && (
                                        <Card>
                                            {selectedSection.id === "basics" ? (
                                                <BasicsItem setHeaderDisplayType={setHeaderDisplayType} />
                                            )
                                            : selectedSection.id === "skills" ? (
                                                <SkillItem />
                                            ) 
                                            : (<SectionDetail
                                                key={selectedSection.id}
                                                selectedSection={selectedSection}
                                            />)}
                                            
                                        </Card>
                                    )}
                                </div>
                                
                            </div>
                            
                            <div
                                style={{
                                    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)'
                                }}
                            >
                                <Resume 
                                    ref={resumeRef} 
                                    headerDisplayType={headerDisplayType} 
                                    textColor={textColor}
                                    contentFontSize={contentFontSize}
                                    titleFontSize={titleFontSize}
                                    lineHeight={lineHeight}
                                    subTitleFontSize={subTitleFontSize}
                                    isBgForPageScroll={true}
                                    templateName={templateName}
                                />
                            </div>

                            
                        </div>
                        
                    </div>
                </div>
            
            </CVContext.Provider>
        )
        
    )
}

function AddIcon({ size }) {
    return (
        <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
            <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                fill="currentColor"
                />{" "}
                <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0574 1.25H11.9426C9.63424 1.24999 7.82519 1.24998 6.41371 1.43975C4.96897 1.63399 3.82895 2.03933 2.93414 2.93414C2.03933 3.82895 1.63399 4.96897 1.43975 6.41371C1.24998 7.82519 1.24999 9.63422 1.25 11.9426V12.0574C1.24999 14.3658 1.24998 16.1748 1.43975 17.5863C1.63399 19.031 2.03933 20.1711 2.93414 21.0659C3.82895 21.9607 4.96897 22.366 6.41371 22.5603C7.82519 22.75 9.63423 22.75 11.9426 22.75H12.0574C14.3658 22.75 16.1748 22.75 17.5863 22.5603C19.031 22.366 20.1711 21.9607 21.0659 21.0659C21.9607 20.1711 22.366 19.031 22.5603 17.5863C22.75 16.1748 22.75 14.3658 22.75 12.0574V11.9426C22.75 9.63423 22.75 7.82519 22.5603 6.41371C22.366 4.96897 21.9607 3.82895 21.0659 2.93414C20.1711 2.03933 19.031 1.63399 17.5863 1.43975C16.1748 1.24998 14.3658 1.24999 12.0574 1.25ZM3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62177 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.2484 7.91356 21.25 9.62177 21.25 12C21.25 14.3782 21.2484 16.0864 21.0736 17.3864C20.9018 18.6648 20.5749 19.4355 20.0052 20.0052C19.4355 20.5749 18.6648 20.9018 17.3864 21.0736C16.0864 21.2484 14.3782 21.25 12 21.25C9.62177 21.25 7.91356 21.2484 6.61358 21.0736C5.33517 20.9018 4.56445 20.5749 3.9948 20.0052C3.42514 19.4355 3.09825 18.6648 2.92637 17.3864C2.75159 16.0864 2.75 14.3782 2.75 12C2.75 9.62177 2.75159 7.91356 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948Z"
                fill="currentColor"
                />{" "}
            </g>
        </svg>        
    )
}


