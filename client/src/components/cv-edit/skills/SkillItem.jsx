import { useCallback, useContext, useState } from "react";
import CVContext from "../CVContext";
import styles from "./styles.module.css"
import QuillEditor from "/src/components/ui/QuillEditor";

export default function SkillItem({  }) {
    const { resumeData, setResumeData } = useContext(CVContext)
    const [skillInfor, setSkillInfor] = useState(resumeData.sections.find(section => section.id === 'skills'));

    const handleInputChange = (fieldName) => (value) => {
        setSkillInfor((prev) => ({
            ...prev,
            [fieldName]: value
        }))

        setResumeData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === "skills"
                    ? { ...section, [fieldName]: value }
                    : section
            ),
        }))

    }

    const handleQuillChange = useCallback((arr) => {
        // arr là string[]
        handleInputChange("items")(arr);
    }, []);
    return (
        <div>
            <div className={styles.inputContainer}>
                <label htmlFor="">Skills:</label>
                <QuillEditor
                    value={skillInfor.items}          // string[]
                    onChange={handleQuillChange}   
                />
            </div>
        </div>
    )
}