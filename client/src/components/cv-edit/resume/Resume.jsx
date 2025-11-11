import React, { useContext, forwardRef } from "react";
import CVContext from "../CVContext";
import ClassicTemplate from "../../cv-template/classic";
import ModernTemplate from "../../cv-template/modern";
import MinimalistTemplate from "../../cv-template/minimalist"

const templateMap = {
  Classic: ClassicTemplate,
  Modern: ModernTemplate,
  Minimalist: MinimalistTemplate
};

const Resume = forwardRef(({ templateName, ...props }, ref) => {
  const { resumeData } = useContext(CVContext);
  const Template = templateMap[templateName] || ClassicTemplate;
  return <Template ref={ref} resume={resumeData} {...props} />;
});

export default Resume;

