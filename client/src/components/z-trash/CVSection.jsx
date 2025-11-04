const keyMap = {
  education: {
    titleKey: "schoolName",
    subtitleKey: "major",
    periodKey: ["start", "end"],
    descriptionKey: "description",
  },
  experience: {
    titleKey: "company",
    subtitleKey: "position",
    periodKey: ["period"],
    descriptionKey: "jobResponsibilities",
  },
  projects: {
    titleKey: "name",
    subtitleKey: "role",
    periodKey: ["period"],
    descriptionKey: "jobResponsibilities",
  },
};

function GenericItem({ item, config }) {
  return (
    <div>
      <div>
        <span>{item[config.titleKey]}</span>
        <span>{item[config.subtitleKey]}</span>
        <span>
          {config.periodKey
            .map((key) => item[key])
            .filter(Boolean)
            .join(" - ")}
        </span>
      </div>
      <ul>
        {(item[config.descriptionKey] || []).map((desc, i) => (
          <li key={i}>{desc}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Section({ section }) {
  const config = keyMap[section.kind];
  return (
    <div>
      <h2>{section.title}</h2>
      <div>
        {section.items.map((item, i) => (
          <GenericItem key={i} item={item} config={config} />
        ))}
      </div>
    </div>
  );
}
