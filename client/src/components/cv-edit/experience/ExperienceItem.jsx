import { useContext, useState, useCallback } from "react"
import { DatePicker, Input, SelectPicker } from "rsuite";

import styles from './styles.module.css'
import QuillEditor from "/src/components/ui/QuillEditor";
import CVContext from "/src/components/cv-edit/CVContext";

export default function ExperienceItem({ item }) {
    const { setResumeData } = useContext(CVContext);
    const [expInfor, setExpInfor] = useState({
        company: item.company,
        position: item.position,
        period: item.period,
        jobResponsibilities: Array.isArray(item.jobResponsibilities) ? item.jobResponsibilities : [],
    })

    const handleInputChange = (fieldName) => (value) => {
        setExpInfor((prev) => ({
            ...prev,
            [fieldName]: value
        }))

        setResumeData((prev) => {
            const updatedSections = prev.sections.map((section) => {
                if (section.id === 'experience') {
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
        handleInputChange("jobResponsibilities")(arr);
    }, []);

    return (
        <div className={styles.container} >
            <div className={styles.expBasics}>
                <div className={styles.inputContainer}>
                    <label htmlFor="">Company Name:</label>
                    <Input
                        type="text" 
                        value={expInfor.company} 
                        onChange={handleInputChange('company')}
                    />
                </div>
                
                <div className={styles.inputContainer}>
                    <label htmlFor="">Position:</label>
                    <Input
                        type="text" 
                        value={expInfor.position} 
                        onChange={handleInputChange('position')}
                    />
                </div>

            </div>

            <div className={styles.inputContainer}>
                <label htmlFor="">Period:</label>
                <Input
                    type="text" 
                    value={expInfor.period} 
                    onChange={handleInputChange('period')}
                />
            </div>

            <div className={styles.inputContainer}>
                <label htmlFor="">Description:</label>
                <QuillEditor 
                    value={expInfor.jobResponsibilities}          // string[]
                    onChange={handleQuillChange}   
                />
            </div>
                        
        </div>
    )
}