import { useCallback, useContext, useState } from "react"
import { DatePicker, Input } from "rsuite";

import styles from './styles.module.css'
import QuillEditor from "/src/components/ui/QuillEditor";
import CVContext from "../CVContext";

export default function EducationItem({ item }) {
    const { setResumeData } = useContext(CVContext)
    const [eduInfor, setEduInfor] = useState({
        schoolName: item.schoolName,
        major: item.major,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
    })

    const handleInputChange = (fieldName) => (value) => {
        setEduInfor((prev) => ({
            ...prev,
            [fieldName]: value
        }))

        setResumeData((prev) => {
            const updatedSections = prev.sections.map((section) => {
                if (section.id === 'education') {
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
            <div className={styles.eduBasics}>
                <div className={styles.inputContainer}>
                    <label htmlFor="">School Name:</label>
                    <Input
                        type="text" 
                        value={eduInfor.schoolName} 
                        onChange={handleInputChange('schoolName')}
                    />
                </div>
                
                <div className={styles.inputContainer}>
                    <label htmlFor="">Major:</label>
                    <Input
                        type="text" 
                        value={eduInfor.major} 
                        onChange={handleInputChange('major')}
                    />
                </div>


                <div className={styles.inputContainer}>
                    <label htmlFor="">Start Date:</label>
                    <DatePicker />
                </div>
                
                <div className={styles.inputContainer}>
                    <label htmlFor="">End Date:</label>
                    <DatePicker />
                </div>


            </div>

            <div className={styles.inputContainer}>
                <label htmlFor="">Description:</label>
                <QuillEditor 
                    value={eduInfor.description}
                    onChange={handleQuillChange}
                />
            </div>
                        
        </div>
    )
}