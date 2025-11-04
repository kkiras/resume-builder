import React, { useEffect, useRef, forwardRef } from "react";
import styles from "./styles.module.css";
import Header from "./sections/basics/Header";
import buildSectionMap from "./sections/sectionMap";
import SkillSection from "./sections/skill/SkillSection";
import { paginateModern } from "./pagination";

function setForwardedRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else try { ref.current = value; } catch {}
}

function ModernTemplateInner({
  resume,
  textColor,
  contentFontSize,
  titleFontSize,
  lineHeight,
  subTitleFontSize,
  comparePadding,
  compareMargin,
  isBgForPageScroll,
  pageScrollHeight,
}, ref) {
  const sourceRef = useRef(null);
  const pagesRef = useRef(null);

  useEffect(() => {
    if (!sourceRef.current || !pagesRef.current) return;
    paginateModern(sourceRef.current, pagesRef.current, styles);
  }, [resume]);

  return (
    <div
      className={styles.pagesScroll}
      style={{
        padding: comparePadding ?? 16,
        marginTop: compareMargin === 0 ? 0 : "8vh",
        backgroundColor: isBgForPageScroll
          ? "color-mix(in oklab, var(--muted) 30%, transparent)"
          : "transparent",
        height: pageScrollHeight ?? "92vh",
      }}
    >
      <div
        ref={sourceRef}
        style={{ display: "none" }}
      >
        <div
          className={styles.layout}
        >
          <div id="cv-left" className={styles.leftSide}>
            {resume?.basics && (
              <Header basics={resume.basics} headerDisplayType="left" />
            )}

            {/* {(() => {
              const skillsSection = resume?.sections?.find((s) => s.kind === "skills");
              if (!skillsSection) return null;
              const sectionMap = buildSectionMap(resume);
              const skillComponent = sectionMap["Skills"];
              return (
                skillComponent &&
                React.cloneElement(skillComponent, { key: skillsSection.id || "skills" })
              );
            })()} */}

            <SkillSection skills={resume?.sections?.find(s => s.kind === "skills")?.items || []} />
          </div>

          <div id="cv-right" className={styles.rightSide}>
            {(() => {
              const sectionMap = buildSectionMap(resume);
              return (
                resume?.sections
                  ?.filter((section) => section.kind !== "skills")
                  .map((section) => {
                    const sectionName = section.title;
                    const sectionComponent = sectionMap[sectionName];
                    return (
                      sectionComponent && (
                        <div className="block" key={section.id || section.title}>
                          {React.cloneElement(sectionComponent)}
                        </div>
                      )
                    );
                  })
              );
            })()}
          </div>
        </div>
      </div>
      <div
        ref={(n) => { pagesRef.current = n; setForwardedRef(ref, n); }}
        className={styles.pages}
        style={{
          "--text-color": textColor,
          "--content-font-size": contentFontSize,
          "--title-font-size": titleFontSize,
          "--line-height": lineHeight,
          "--sub-title-font-size": subTitleFontSize,
        }}
      />
    </div>
  );
}

export default forwardRef(ModernTemplateInner);
