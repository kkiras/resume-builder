import styles from "./styles.classic.module.css";

function ExperienceItem({ exp }) {
  return (
    <>
      <div className={styles.itemDetailHeader}>
        <span>{exp.company}</span>
        <span>{exp.position}</span>
        <span>{exp.period}</span>
      </div>

      <ul className={styles.itemDetailContent}>
        {exp.jobResponsibilities.map((res, index) => (
          <li key={index}>{res}</li>
        ))}
      </ul>
    </>
  );
}

export default function ExperienceSection({ experience }) {
  return (
    <div>
            <div className={styles.sectionLine} />
      <h3 className={styles.title}>Experience</h3>

      {experience.map((exp) => (
        <ExperienceItem key={exp.id} exp={exp} />
      ))}
    </div>
  );
}

