import React, { useMemo, useRef, useState, forwardRef } from "react";
import styles from "./styles.module.css";
import Header from "./sections/basics/Header";
import buildSectionMap from "./sections/sectionMap";
import NewSection from "./sections/new/NewSection"

function setForwardedRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else try { ref.current = value; } catch {}
}

function MinimalistTemplateInner(
  {
    resume,
    textColor,
    contentFontSize,
    titleFontSize,
    lineHeight,
    subTitleFontSize,
    headerDisplayType,
  },
  ref
) {
  const pagesStyleVars = useMemo(
    () => ({
      ["--text-color"]: textColor,
      ["--content-font-size"]: contentFontSize,
      ["--title-font-size"]: titleFontSize,
      ["--line-height"]: lineHeight,
      ["--sub-title-font-size"]: subTitleFontSize,
    }),
    [textColor, contentFontSize, titleFontSize, lineHeight, subTitleFontSize]
  );

  // Nội dung “div dài” như trước đây
  const LongContent = (
    // <div className={styles.page}>
    <div
        style={{
            backgroundColor: 'white',
            padding: '48px',
        }}
    >
      <div className={styles.layout}>
        <div id="cv-left" className={styles.leftSide}>
        {resume?.basics && (
          <Header basics={resume.basics} templateName="Classic" headerDisplayType={headerDisplayType} />
        )}
        {(() => {
            const sectionMap = buildSectionMap(resume);
            return (
                resume?.sections?.map((section) => {
                const sectionKind = section.kind;
                if (sectionKind === 'generic') {
                    return (
                    <NewSection
                        key={section.id || section.title}
                        title={section.title}
                        items={Array.isArray(section.items) ? section.items : []}
                    />
                    );
                }
                const sectionComponent = sectionMap[sectionKind];
                return (
                    sectionComponent &&
                    React.cloneElement(sectionComponent, { key: section.id || section.title })
                );
                })
            );
            })()}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      style={{
        backgroundColor: 'var(--muted)',
        padding: 24,
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: '92vh',
      }}
    >
      <div
        className={styles.pagesScroll}
        ref={(n) => setForwardedRef(ref, n)}
                style={{
          "--text-color": textColor,
          "--content-font-size": contentFontSize,
          "--title-font-size": titleFontSize,
          "--line-height": lineHeight,
          "--sub-title-font-size": subTitleFontSize,
        }}
      >
        {LongContent}
      </div>
    </div>

  );
}

export default forwardRef(MinimalistTemplateInner);
