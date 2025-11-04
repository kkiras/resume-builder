import { Button, ButtonGroup, ButtonToolbar, DatePicker, Input } from "rsuite"
import { LocationIcon, CalendarIcon, MailIcon, PhoneIcon, AvaDisplayLeftIcon, AvaDisplayMidIcon, AvaDisplayRightIcon } from "../../../libs/icons/index"
import styles from "./styles.module.css"
import { useContext, useRef, useState } from "react"
import CVContext from "../CVContext"

export default function BasicsItem({ setHeaderDisplayType }) {
    const iconSize = 24
    const iconColor = 'black'
    const { resumeData, setResumeData } = useContext(CVContext)
    const [basicsInfor, setBasicsInfor] = useState(resumeData.basics);
    const [avatar, setAvatar] = useState(resumeData?.basics?.avatar || '')
    const inputAvatarRef = useRef(null)

    console.log('Basics Section:',resumeData.basics)

    const handleInputChange = (fieldName) => (value) => {
        setBasicsInfor((prev) => ({
            ...prev,
            [fieldName]: value
        }))

        setResumeData((prev) => ({
            ...prev,
            basics: {
                ...prev.basics,
                [fieldName]: value
            }
        }))

    }

    const handleAvatarUpload = () => {
        inputAvatarRef.current?.click();
    }

    const handleAvatarChange = (e) => {
        const file = e?.target?.files?.[0]
        if (!file) return
        const objectUrl = URL.createObjectURL(file)
        setAvatar(objectUrl)

        // Sync into resumeData.basics.avatar
        setResumeData((prev) => ({
            ...prev,
            basics: {
                ...prev?.basics,
                avatar: objectUrl,
            }
        }))
    }

    return (
        <div>
            <h3 className={styles.sectionTitle}>Profile</h3>
            <div className={styles.headerAlignment}>
                <span>Header Align</span>
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        background: 'var(--bg)',
                        width: 'fit-content',
                        justifyContent: 'space-between',
                        margin: 'auto',
                        padding: '4px'
                    }}
                >
                    <Button onClick={() => setHeaderDisplayType('left') }>
                        <AvaDisplayLeftIcon size={40} color={'#313131'} />
                    </Button>
                    <Button onClick={() => setHeaderDisplayType('mid')} >
                        <AvaDisplayMidIcon size={40} color={'#313131'} />
                    </Button>
                    <Button onClick={() => setHeaderDisplayType('right')} >
                        <AvaDisplayRightIcon size={40} color={'#313131'} />
                    </Button>

                </div>
            </div>
            
            <div>
                
                <div className={styles.inputFieldFlex}>
                    <div>
                        <span>Avatar</span>
                        <div className={styles.avatarField}>
                            {avatar ? (
                                <>
                                    <div className={styles.avatarContainer}>
                                        <img className={styles.avatar} src={avatar} alt="avatar" />

                                        <div className={styles.avatarContainerHover} onClick={handleAvatarUpload}>
                                            <UploadIcon size={24} />
                                        </div>     
                                    </div>

                           
                                </>

                            ) : (
                                <div className={styles.avatarContainerEmpty} onClick={handleAvatarUpload}>
                                    <UploadIcon size={20} />
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleAvatarChange}
                                ref={inputAvatarRef}
                                className={styles.avatarInput}
                            />
                        </div>
                    </div>

                    <div className={styles.inputContainer} >
                        <label htmlFor="">Name</label>
                        <Input 
                            value={basicsInfor.name}
                            onChange={handleInputChange('name')}
                        />
                    </div>

                    <div className={styles.inputContainer} >
                        <label htmlFor="">Major</label>
                        <Input 
                            value={basicsInfor.title}
                            onChange={handleInputChange('title')}
                        />
                    </div>

                    <div className={styles.inputContainer} >
                        <CalendarIcon size={iconSize} color={iconColor} />
                        <label htmlFor="">Birth Date</label>
                        <DatePicker
                            oneTap

                        />
                    </div>

                    <div className={styles.inputContainer} >
                        <MailIcon size={iconSize} color={iconColor} />
                        <label htmlFor="">E-mail</label>
                        <Input 
                            value={basicsInfor.email}
                            onChange={handleInputChange('email')}
                        />
                    </div>

                    <div className={styles.inputContainer} >
                        <PhoneIcon size={iconSize} color={iconColor} />
                        <label htmlFor="">Phone</label>
                        <Input 
                            value={basicsInfor.phone}
                            onChange={handleInputChange('phone')}
                        />
                    </div>

                     <div className={styles.inputContainer}>
                        <LocationIcon size={iconSize} color={iconColor} />
                        <label htmlFor="">Location</label>
                        <Input 
                            value={basicsInfor.location}
                            onChange={handleInputChange('location')}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

function UploadIcon({ size }) {
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
                d="M12.5535 2.49392C12.4114 2.33852 12.2106 2.25 12 2.25C11.7894 2.25 11.5886 2.33852 11.4465 2.49392L7.44648 6.86892C7.16698 7.17462 7.18822 7.64902 7.49392 7.92852C7.79963 8.20802 8.27402 8.18678 8.55352 7.88108L11.25 4.9318V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V4.9318L15.4465 7.88108C15.726 8.18678 16.2004 8.20802 16.5061 7.92852C16.8118 7.64902 16.833 7.17462 16.5535 6.86892L12.5535 2.49392Z"
                fill="currentColor"
                />{" "}
                <path
                d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z"
                fill="currentColor"
                />{" "}
            </g>
        </svg>
    )
}
