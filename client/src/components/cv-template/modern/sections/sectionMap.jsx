import SkillSection from "./skill/SkillSection";
import EducationSection from "./education/EducationSection";
import ProjectsSection from "./projects/ProjectsSection";
import ExperienceSection from "./experience/ExperienceSection";

export default function buildSectionMap(resume) {
  return {
    Skills: (
      <SkillSection skills={resume?.sections?.find(s => s.kind === "skills")?.items || []} />
    ),
    Education: (
      <EducationSection educations={resume?.sections?.find(s => s.kind === "education")?.items || []} />
    ),
    Experience: (
      <ExperienceSection experience={resume?.sections?.find(s => s.kind === "experience")?.items || []} />
    ),
    Projects: (
      <ProjectsSection projects={resume?.sections?.find(s => s.kind === "projects")?.items || []} />
    ),
  };
}
