import styles from "./styles.classic.module.css";

export default function SkillSection({ skills }) {
  return (
    <div className={styles.container}>
      <div className={styles.sectionLine} />
      <h3 className={styles.title}>Skills</h3>

      <ul className={styles.itemDetailContent}>
        {skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}

