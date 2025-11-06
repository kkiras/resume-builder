import { useCallback, useContext, useMemo, useState } from "react";
import { Input } from "rsuite";
import QuillEditor from "/src/components/ui/QuillEditor";
import CVContext from "../CVContext";
import styles from "./styles.module.css";

export default function NewItem({ item }) {
  const { setResumeData } = useContext(CVContext);

  const initialDetail = useMemo(() => {
    if (Array.isArray(item.detail)) return item.detail;
    if (typeof item.detail === 'string' && item.detail.trim()) return [item.detail.trim()];
    return [];
  }, [item.detail]);

  const [info, setInfo] = useState({
    name: item.name || "",
    role: item.role || "",
    time: item.time || "",
    detail: initialDetail,
  });

  const updateInContext = (fieldName, value) => {
    setResumeData((prev) => {
      if (!prev?.sections) return prev;
      const nextSections = prev.sections.map((section) => {
        if (!Array.isArray(section.items)) return section;
        const hasItem = section.items.some((i) => i.id === item.id);
        if (!hasItem) return section;
        const updatedItems = section.items.map((i) => (
          i.id === item.id ? { ...i, [fieldName]: value } : i
        ));
        return { ...section, items: updatedItems };
      });
      return { ...prev, sections: nextSections };
    });
  };

  const handleInputChange = (fieldName) => (value) => {
    setInfo((prev) => ({ ...prev, [fieldName]: value }));
    updateInContext(fieldName, value);
  };

  const handleQuillChange = useCallback((arr) => {
    handleInputChange("detail")(arr);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.basicsGrid}>
        <div className={styles.inputContainer}>
          <label>Name:</label>
          <Input
            type="text"
            value={info.name}
            onChange={handleInputChange('name')}
            placeholder="e.g., Certificate, Award, Publication"
          />
        </div>

        <div className={styles.inputContainer}>
          <label>Role:</label>
          <Input
            type="text"
            value={info.role}
            onChange={handleInputChange('role')}
            placeholder="e.g., Author, Lead, Participant"
          />
        </div>

        <div className={styles.inputContainer}>
          <label>Time:</label>
          <Input
            type="text"
            value={info.time}
            onChange={handleInputChange('time')}
            placeholder="e.g., 2023 - Present"
          />
        </div>
      </div>

      <div className={styles.inputContainer}>
        <label>Detail:</label>
        <QuillEditor value={info.detail} onChange={handleQuillChange} />
      </div>
    </div>
  );
}

