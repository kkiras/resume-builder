import React, { forwardRef } from "react";
import styles from "./styles.module.css";

function ModernTemplateInner({
  sourceRef,
  pagesRef,
  children,
  comparePadding,
  compareMargin,
  isBgForPageScroll,
  pageScrollHeight,
  textColor,
  contentFontSize,
  titleFontSize,
  lineHeight,
  subTitleFontSize,
}, ref) {
  return (
    <div id="cv-container">
      <div
        id="cv"
        ref={sourceRef}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "12mm",
          background: "#fff",
          position: "absolute",
          left: "-99999px",
          top: 0,
        }}
      >
        {children}
      </div>

      <div
        className={styles.pagesScroll}
        ref={ref}
        style={{
          padding: comparePadding ? comparePadding : 16,
          marginTop: compareMargin === 0 ? compareMargin : "8vh",
          backgroundColor: isBgForPageScroll
            ? "color-mix(in oklab, var(--muted) 30%, transparent)"
            : "transparent",
          height: pageScrollHeight ? pageScrollHeight : "92vh",
        }}
      >
        <div
          className={styles.pages}
          ref={pagesRef}
          style={{
            "--text-color": textColor,
            "--content-font-size": contentFontSize,
            "--title-font-size": titleFontSize,
            "--line-height": lineHeight,
            "--sub-title-font-size": subTitleFontSize,
          }}
        />
      </div>
    </div>
  );
}

export default forwardRef(ModernTemplateInner);

