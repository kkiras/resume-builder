import { useEffect, useState } from "react"
import styles from "./styles.module.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox } from "rsuite";
import { sampleResume } from "../../../data/sampleResume"

export default function Resumes(){
    const [resumes, setResumes] = useState();
    const [compareMode, setCompareMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState([])
    const userId = "68f10f356594cb494a29067e"

    useEffect(()=> {
        if (!resumes) {
            const getResumes = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/resumeRoutes/get-resumes`);
                    console.log('Resumes:', res.data.resumes);
                    setResumes(res.data.resumes);

                } catch (err) {
                    console.log(err);
                }
            } 
            
            getResumes();
        }

    },[])

    const handleCreate = async () => {
        try {
            const newResume = {
                ...sampleResume,
                userId: userId,
                name: "ABCDEFG",
                createdAt: Date.now,
                updatedAt: Date.now,
            } 
            const res = await axios.post('http://localhost:5000/api/resumeRoutes/create-resume', newResume);
            alert('Create successfully!');
            setResumes(prev => [
                ...prev,
                newResume
            ])

        } catch (err) {
            alert(err.response.data.message)
        }
    }

    const duplicate = async (coppiedResume) => {
        try {
            const newResume = {
                ...coppiedResume,
                userId: userId,
                name: coppiedResume.name + '_copy',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }

            const res = await axios.post('http://localhost:5000/api/resumeRoutes/duplicate', newResume);
            alert(res.data.message);
            setResumes(prev => [ ...prev, res.data.newResume ])

        } catch (err) {
            alert(err.response.data.message)
        }
    }

    
    
    const selectedCount = selectedIds.length
    const navigate = useNavigate();

    const toggleCompareMode = () => {
        setCompareMode((v) => {
            const next = !v
            if (!next) setSelectedIds([])
            return next
        })
    }

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const exists = prev.includes(id)
            if (exists) return prev.filter(x => x !== id)
            if (prev.length >= 2) return prev // enforce max 2
            return [...prev, id]
        })
    }

    return (
        <div className={styles.container}>
            <h2>My Resumes</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button onClick={toggleCompareMode}>
                    {compareMode ? 'Exit compare mode' : 'Enter compare mode'}
                </Button>
                {compareMode && selectedCount < 2 && (
                    <span> Select {2 - selectedCount} more resume to compare</span>
                )}
                {compareMode && selectedCount === 2 && (
                    <Button 
                        appearance="primary"
                        onClick={() => {
                            const selected = resumes.filter(r => selectedIds.includes(r._id)).slice(0, 2)
                            localStorage.setItem('compareSelection', JSON.stringify(selected))
                            navigate('/dashboard/compare', { state: { resumes: selected } })
                        }}
                    >
                        Compare
                    </Button>
                )}
            </div>

            <div className={styles.gridDisplay}>
                <div 
                    className={`${styles.gridItem} ${styles.newResume}`}
                    onClick={handleCreate}
                >
                    <div>
                        {plus}
                    </div>
                    <span>Create New Resume</span>
                </div>

                {resumes && (
                    resumes.map(resume => (
                        <ResumeCard 
                            key={resume._id} 
                            resume={resume}
                            compareMode={compareMode}
                            selected={selectedIds.includes(resume._id)}
                            onToggleSelect={() => toggleSelect(resume._id)}
                            onDuplicate={duplicate}
                        />
                    ))
                )}
            </div>       
        </div>
        
    )
}

function ResumeCard({ resume, compareMode = false, selected = false, onToggleSelect, onDuplicate }) {
    const { name, createdAt, updatedAt } = resume 
    const navigate = useNavigate();

    const handleItemClick = (resume) => {
        if (compareMode) {
            onToggleSelect?.()
            return
        }
        localStorage.setItem("resumeEditing", JSON.stringify(resume));
        navigate("/edit")
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
        const time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${formattedDate} (${time})`;
    }

    return ( 
        <div className={styles.gridItem} onClick={ compareMode ? () => handleItemClick(resume) : null}>
            <span className={styles.itemName}>{name}</span> 
            <div className={styles.dayRefGroup}>
                <span className={styles.dayRef}>Created: {formatDate(createdAt)}</span>
                <span className={styles.dayRef}>Updated: {formatDate(updatedAt)}</span>
            </div>

            {compareMode ? (
                <div className={styles.checkboxWrap}>
                    <Checkbox checked={selected} readOnly />
                </div>
            ) : (
                <div className={styles.buttonGroup} >
                    <Button 
                        style={{ display: 'flex', alignItems: 'start', gap: 8, flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); handleItemClick(resume) }}
                    >
                        {editSVG} 
                        <span>Edit</span>
                    </Button>
                    <Button onClick={() => onDuplicate(resume)}>
                        <DuplicateIcon size={18} />
                    </Button>
                    <Button onClick={(e) => e.stopPropagation()}>{removeSVG}</Button>
                </div>
            )}
        </div>
    )
}

const editSVG = (
    
    <svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#162525" >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <title></title> 
            <g id="Complete"> 
                <g id="edit"> 
                    <g> 
                        <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#162525" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path> 
                        <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#162525" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon> 
                    </g> 
                </g> 
            </g> 
        </g>
    </svg>
)

const removeSVG = (
    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#e6a599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> 
        </g>
    </svg>
)

const plus = (
    <svg style={{verticalAlign: 'middle'}} width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"> 
            <path d="M6 12H18M12 6V18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </g>
    </svg>
)

function DuplicateIcon({ size }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
            fill="#000000"
            >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
            <g id="SVGRepo_iconCarrier">
                {" "}
                <title>duplicate</title> <desc>Created with Sketch Beta.</desc>{" "}
                <defs> </defs>{" "}
                <g
                id="Page-1"
                stroke="none"
                strokeWidth={1}
                fill="none"
                fillRule="evenodd"
                sketch:type="MSPage"
                >
                {" "}
                <g
                    id="Icon-Set"
                    sketch:type="MSLayerGroup"
                    transform="translate(-204.000000, -931.000000)"
                    fill="#000000"
                >
                    {" "}
                    <path
                    d="M234,951 C234,952.104 233.104,953 232,953 L216,953 C214.896,953 214,952.104 214,951 L214,935 C214,933.896 214.896,933 216,933 L232,933 C233.104,933 234,933.896 234,935 L234,951 L234,951 Z M232,931 L216,931 C213.791,931 212,932.791 212,935 L212,951 C212,953.209 213.791,955 216,955 L232,955 C234.209,955 236,953.209 236,951 L236,935 C236,932.791 234.209,931 232,931 L232,931 Z M226,959 C226,960.104 225.104,961 224,961 L208,961 C206.896,961 206,960.104 206,959 L206,943 C206,941.896 206.896,941 208,941 L210,941 L210,939 L208,939 C205.791,939 204,940.791 204,943 L204,959 C204,961.209 205.791,963 208,963 L224,963 C226.209,963 228,961.209 228,959 L228,957 L226,957 L226,959 L226,959 Z"
                    id="duplicate"
                    sketch:type="MSShapeGroup"
                    >
                    {" "}
                    </path>{" "}
                </g>{" "}
                </g>{" "}
            </g>
        </svg>
    )
}
