import { useCallback, useContext, useState } from "react"
import { DatePicker, Input } from "rsuite";

import styles from './styles.module.css'
import QuillEditor from "/src/components/ui/QuillEditor";
import CVContext from "../CVContext";

export default function ProjectItem({ item }) {
    const { setResumeData } = useContext(CVContext)
    const [projInfor, setEduInfor] = useState({
        name: item.name,
        role: item.role,
        link: item.link,
        period: item.period,
        description: item.description,
    })

    const handleInputChange = (fieldName) => (value) => {
        setEduInfor((prev) => ({
            ...prev,
            [fieldName]: value
        }))

        setResumeData((prev) => {
            const updatedSections = prev.sections.map((section) => {
                if (section.id === 'projects') {
                    const updatedItems = section.items.map((i) => {
                        if (i.id === item.id) {
                            return {
                                ...i,
                                [fieldName]: value
                            };
                        }
                        return i;
                    });
                    return {
                        ...section,
                        items: updatedItems
                    };
                }
                return section;
            });

            return {
                ...prev,
                sections: updatedSections,
            };
        });
    };

    const handleQuillChange = useCallback((arr) => {
        // arr là string[]
        handleInputChange("description")(arr);
    }, []);

    return (
        <div className={styles.container} >
            <div className={styles.projBasics}>
                <div className={styles.inputContainer}>
                    <label htmlFor="">Name:</label>
                    <Input
                        type="text" 
                        value={projInfor.name}
                        onChange={handleInputChange('name')}
                    />
                </div>
                
                <div className={styles.inputContainer}>
                    <label htmlFor="">Role:</label>
                    <Input
                        type="text" 
                        value={projInfor.role}
                        onChange={handleInputChange('role')}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <label htmlFor="">Link:</label>
                    <Input
                        type="text" 
                        value={projInfor.link}
                        onChange={handleInputChange('link')}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <label htmlFor="">Period:</label>
                    <Input
                        type="text" 
                        value={projInfor.period}
                        onChange={handleInputChange('period')}
                    />
                </div>

            </div>

            <div className={styles.inputContainer}>
                <label htmlFor="">Description:</label>
                <QuillEditor 
                    value={projInfor.description}
                    onChange={handleQuillChange}

                />
            </div>
                        
        </div>
    )
}