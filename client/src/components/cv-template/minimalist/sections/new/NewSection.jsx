import styles from "./styles.module.css";

function NewSectionItem({ item }) {
  const details = Array.isArray(item.detail)
    ? item.detail
    : (typeof item.detail === 'string' && item.detail.trim() ? [item.detail.trim()] : []);

  return (
    <>
      <div className={styles.itemHeader}>
        <span>{item.name}</span>
        <span>{item.role}</span>
        <span>{item.time}</span>
      </div>

      {details.length > 0 && (
        <ul className={styles.itemContent}>
          {details.map((d, idx) => (
            <li key={idx}>{d}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function NewSection({ title, items }) {
  return (
    <div>
            <div className={styles.sectionLine} />
      <h3 className={styles.title}>{title}</h3>

      {items.map((it) => (
        <NewSectionItem key={it.id} item={it} />
      ))}
    </div>
  );
}

