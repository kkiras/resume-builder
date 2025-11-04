import Classic from "../../cv-template/classic";
import Modern from "../../cv-template/modern";
import classicStyles from "../../cv-template/classic/styles.module.css";
import modernStyles from "../../cv-template/modern/styles.module.css";

export default function getTemplateMap() {
  return {
    Classic: { Component: Classic, styles: classicStyles },
    Modern: { Component: Modern, styles: modernStyles },
  };
}

export { modernStyles };

