import SkillSection from "./skill/SkillSection";
import EducationSection from "./education/EducationSection";
import ProjectsSection from "./projects/ProjectsSection";
import ExperienceSection from "./experience/ExperienceSection";
import NewSection from "./new/NewSection";

export default function buildSectionMap(resume) {
  const map = {
    skills: (
      <SkillSection skills={resume?.sections?.find(s => s.kind === "skills")?.items || []} />
    ),
    education: (
      <EducationSection educations={resume?.sections?.find(s => s.kind === "education")?.items || []} />
    ),
    experience: (
      <ExperienceSection experience={resume?.sections?.find(s => s.kind === "experience")?.items || []} />
    ),
    projects: (
      <ProjectsSection projects={resume?.sections?.find(s => s.kind === "projects")?.items || []} />
    ),
  };

  // Dynamically add any generic sections (custom user-created)
  (resume?.sections || [])
    .filter((s) => s?.kind === 'generic' && typeof s?.title === 'string')
    .forEach((s) => {
      map[s.title] = (
        <NewSection title={s.title} items={Array.isArray(s.items) ? s.items : []} />
      );
    });

  return map;
}
