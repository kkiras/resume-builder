import styles from "./styles.classic.module.css";

function ProjectItem({ project }) {
  return (
    <>
      <div className={styles.itemDetailHeader}>
        <span>{project.name}</span>
        <span>{project.role}</span>
        <span>{project.period}</span>
      </div>

      <ul className={styles.itemDetailContent}>
        {project.description.map((des, index) => (
          <li key={index}>{des}</li>
        ))}
      </ul>
    </>
  );
}

export default function ProjectsSection({ projects }) {
  return (
    <div>
      <h3 className={styles.title}>Projects</h3>
      <div className={styles.sectionLine} />
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
}

