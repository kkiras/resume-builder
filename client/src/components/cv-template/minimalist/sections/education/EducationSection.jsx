import styles from "./styles.classic.module.css";

function EducationItem({ education }) {
  return (
    <>
      <div className={styles.itemDetailHeader}>
        <span>{education.schoolName}</span>
        <span>{education.major}</span>
        <span>
          {education.start} - {education.end}
        </span>
      </div>

      <ul className={styles.itemDetailContent}>
        {education.description.map((des, index) => (
          <li key={index}>{des}</li>
        ))}
      </ul>
    </>
  );
}

export default function EducationSection({ educations }) {
  return (
    <div>
            <div className={styles.sectionLine} />
      <h3 className={styles.title}>Education</h3>

      {educations.map((edu) => (
        <EducationItem key={edu.id} education={edu} />
      ))}
    </div>
  );
}

