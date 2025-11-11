// import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
// import styles from "./styles.module.css";
// import Header from "./sections/basics/Header";
// import buildSectionMap from "./sections/sectionMap";
// import SkillSection from "./sections/skill/SkillSection";

// const A4_HEIGHT_PX = 1122; // ~297mm @96dpi

// function setForwardedRef(ref, value) {
//   if (!ref) return;
//   if (typeof ref === "function") ref(value);
//   else try { ref.current = value; } catch {}
// }

// function ModernTemplateInner(
//   {
//     resume,
//     textColor,
//     contentFontSize,
//     titleFontSize,
//     lineHeight,
//     subTitleFontSize,
//     comparePadding,
//     compareMargin,
//     isBgForPageScroll,
//     pageScrollHeight,
//   },
//   ref
// ) {
//   const layoutRef = useRef(null);    // layout thật đang hiển thị
//   const overlayRef = useRef(null);   // overlay để vẽ vạch cắt
//   const [cuts, setCuts] = useState([]); // danh sách toạ độ top (px) của vạch cắt

//   // Tính các vị trí vạch cắt mỗi khi nội dung đổi kích thước
//   // useEffect(() => {
//   //   if (!layoutRef.current) return;

//   //   const el = layoutRef.current;
//   //   const ro = new ResizeObserver(() => {
//   //     const total = el.scrollHeight; // chiều cao toàn bộ tài liệu
//   //     const count = Math.floor(total / A4_HEIGHT_PX); // số vạch cần vẽ
//   //     const positions = [];
//   //     for (let i = 1; i <= count; i++) positions.push(i * A4_HEIGHT_PX);
//   //     setCuts(positions);
//   //   });

//   //   ro.observe(el);
//   //   return () => ro.disconnect();
//   // }, [resume]);

//   // Cho phép phần .pages (khung cuộn so sánh) vẫn nhận ref ngoài nếu bạn cần
//   const pagesStyle = useMemo(
//     () => ({
//       "--text-color": textColor,
//       "--content-font-size": contentFontSize,
//       "--title-font-size": titleFontSize,
//       "--line-height": lineHeight,
//       "--sub-title-font-size": subTitleFontSize,
//     }),
//     [textColor, contentFontSize, titleFontSize, lineHeight, subTitleFontSize]
//   );

//   return (
//     <div
//       className={styles.pagesScroll}
//       style={{
//         padding: comparePadding ?? 16,
//         marginTop: compareMargin === 0 ? 0 : "8vh",
//         backgroundColor: isBgForPageScroll
//           ? "var(--muted)"
//           : "transparent",
//         height: pageScrollHeight ?? "92vh",
//         position: "relative", // để overlay định vị theo container cuộn
//         overflow: "auto",
//       }}
//       ref={(n) => { setForwardedRef(ref, n); }}
//     >
//       {/* Layout gốc: KHÔNG phân trang */}
//       <div
//         ref={layoutRef}
//         className={styles.page}  // nếu có .page (padding/width A4) thì tận dụng
//         style={pagesStyle}
//       >
//         <div className={styles.layout}>
//           <div id="cv-left" className={styles.leftSide}>
//             {resume?.basics && (
//               <Header basics={resume.basics} headerDisplayType="left" />
//             )}
//             <SkillSection
//               skills={resume?.sections?.find((s) => s.kind === "skills")?.items || []}
//             />
//           </div>

//           <div id="cv-right" className={styles.rightSide}>
//             {(() => {
//               const sectionMap = buildSectionMap(resume);
//               return resume?.sections
//                 ?.filter((s) => s.kind !== "skills")
//                 .map((section) => {
//                   const SectionComp = sectionMap[section.title];
//                   return (
//                     SectionComp && (
//                       <div className="block" key={section.id || section.title}>
//                         {React.cloneElement(SectionComp)}
//                       </div>
//                     )
//                   );
//                 });
//             })()}
//           </div>
//         </div>
//       </div>

//       {/* Overlay vẽ vạch cắt
//       <div className={styles.cutOverlay} ref={overlayRef} aria-hidden="true">
//         {cuts.map((y, i) => (
//           <div
//             key={i}
//             className={styles.cutLine}
//             style={{ top: `${y}px` }}
//             title={`Cut line #${i + 1}`}
//           />
//         ))}
//       </div> */}
//     </div>
//   );
// }

// export default forwardRef(ModernTemplateInner);

import React, { useMemo, useRef, useState, forwardRef } from "react";
import styles from "./styles.module.css";
import Header from "./sections/basics/Header";
import buildSectionMap from "./sections/sectionMap";
import SkillSection from "./sections/skill/SkillSection";
import PagedPreview from "./PagedPreview"; // <-- file ở trên

function setForwardedRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else try { ref.current = value; } catch {}
}

function ModernTemplateInner(
  {
    resume,
    textColor,
    contentFontSize,
    titleFontSize,
    lineHeight,
    subTitleFontSize,
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

    >
      <div className={styles.layout}>
        <div id="cv-left" className={styles.leftSide}>
          {resume?.basics && (
            <Header basics={resume.basics} headerDisplayType="left" />
          )}
          <SkillSection
            skills={
              resume?.sections?.find((s) => s.kind === "skills")?.items || []
            }
          />
        </div>

        <div id="cv-right" className={styles.rightSide}>
          {(() => {
            const sectionMap = buildSectionMap(resume);
            return resume?.sections
              ?.filter((s) => s.kind !== "skills")
              .map((section) => {
                const SectionComp = sectionMap[section.title];
                return (
                  SectionComp && (
                    <div
                      // className="avoid-break" // hạn chế vỡ khối
                      key={section.id || section.title}
                    >
                      {React.cloneElement(SectionComp)}
                    </div>
                  )
                );
              });
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
      >
        {LongContent}
      </div>
    </div>

  );
}

export default forwardRef(ModernTemplateInner);
