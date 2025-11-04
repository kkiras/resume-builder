import styles from "./styles.classic.module.css";

export default function SkillSection({ skills }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Skills</h3>
      <div className={styles.sectionLine} />
      <ul className={styles.itemDetailContent}>
        {skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}

