import React, { useEffect, useRef, forwardRef } from "react";
import styles from "./styles.module.css";
import { paginateOneColumn } from "./pagination";
import Header from "./sections/basics/Header";
import buildSectionMap from "./sections/sectionMap";

function setForwardedRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else try { ref.current = value; } catch {}
}

function ClassicTemplateInner({
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
    paginateOneColumn(sourceRef.current, pagesRef.current, styles);
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
        {resume?.basics && (
          <Header basics={resume.basics} templateName="Classic" headerDisplayType="left" />
        )}
        {(() => {
          const sectionMap = buildSectionMap(resume);
          return (
            resume?.sections?.map((section) => {
              const sectionName = section.title;
              const sectionComponent = sectionMap[sectionName];
              return (
                sectionComponent &&
                React.cloneElement(sectionComponent, { key: section.id || section.title })
              );
            })
          );
        })()}
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

export default forwardRef(ClassicTemplateInner);
