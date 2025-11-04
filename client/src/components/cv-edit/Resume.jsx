import Header from "./basics/section/Header";
import SkillSection from "./skills/section/SkillSection";
import EducationSection from "./education/section/EducationSection";
import ProjectsSection from "./projects/section/ProjectsSection";
import ExperienceSection from "./experience/section/ExperienceSection";
import React, { forwardRef, useContext, useEffect, useRef, useState } from "react";
import CVContext from "./CVContext";
import ClassicTemplate from "../cv-template/classic/ClassicTemplate";
import classicStyles from "../cv-template/classic/styles.module.css";
import MinimalistTemplate from "../cv-template/minimalist/MinimalistTemplate";
import minimalistStyles from "../cv-template/minimalist/styles.module.css";
import ModernTemplate from "../cv-template/modern/ModernTemplate";
import modernStyles from "../cv-template/modern/styles.module.css";

/** ====== Các hằng số an toàn ====== */
const MAX_PAGES = 60;          // giới hạn số trang để tránh vòng lặp bất tận
const MAX_SPLIT_STEPS = 10000; // giới hạn số bước tách text/binary search

const Resume = forwardRef(
  (
    {
      headerDisplayType,
      textColor,
      contentFontSize,
      titleFontSize,
      lineHeight,
      subTitleFontSize,
      comparePadding,
      compareMargin,
      isBgForPageScroll,
      pageScrollHeight,
    },
    ref
  ) => {
    const { resumeData: resume } = useContext(CVContext);

    const template = {
      id: 1,
      name: "Modern",
    };

    const templateName = template?.name;
    const templateMap = {
      Classic: { Component: ClassicTemplate, styles: classicStyles },
      Minimalist: { Component: MinimalistTemplate, styles: minimalistStyles },
      Modern: { Component: ModernTemplate, styles: modernStyles },
    };
    const currentTemplate = templateMap[templateName];
    const TemplateComp = currentTemplate?.Component;
    const pageClass = currentTemplate?.styles?.page || "page";

    const sectionMap = {
      Skills: (
        <SkillSection
          skills={resume?.sections?.find((s) => s.kind === "skills")?.items || []}
        />
      ),
      Education: (
        <EducationSection
          educations={
            resume?.sections?.find((s) => s.kind === "education")?.items || []
          }
        />
      ),
      Experience: (
        <ExperienceSection
          experience={
            resume?.sections?.find((s) => s.kind === "experience")?.items || []
          }
        />
      ),
      Projects: (
        <ProjectsSection
          projects={resume?.sections?.find((s) => s.kind === "projects")?.items || []}
        />
      ),
    };

    const sourceRef = useRef(null); // nguồn để đo & clone
    const pagesRef = useRef(null); // nơi render các trang

    const paginatingRef = useRef(false);

    useEffect(() => {
      const targetEl = pagesRef.current;
      if (!targetEl || paginatingRef.current) return;
      if (!sourceRef.current) return; // chưa có DOM nguồn → bỏ qua vòng này

      paginatingRef.current = true;
      const cancel = () => {
        paginatingRef.current = false;
      };

      try {
        requestAnimationFrame(() => {
          try {
            console.time("paginate");
            // ====== Modern (hai cột) ======
            if (templateName === "Modern") {
              const sourceEl = sourceRef.current;
              if (!sourceEl) return cancel();

              const leftEl = sourceEl.querySelector("#cv-left");
              const rightEl = sourceEl.querySelector("#cv-right");
              if (!leftEl || !rightEl) return cancel();

              // Tạo sample để đo chiều cao vùng main
              const sample = document.createElement("div");
              sample.className = pageClass;

              const columns = document.createElement("div");
              columns.className = modernStyles.columns || "columns";

              const sidebar = document.createElement("div");
              sidebar.className = modernStyles.sidebar || "sidebar";

              const main = document.createElement("div");
              main.className = modernStyles.main || "main";
              // kích hoạt layout thật để clientHeight khác 0
              main.innerHTML = '<div style="height:0"></div>';

              columns.appendChild(sidebar);
              columns.appendChild(main);
              sample.appendChild(columns);
              sample.style.visibility = "hidden";
              sample.style.pointerEvents = "none";
              targetEl.appendChild(sample);

              let mainMaxPx = main.clientHeight;
              targetEl.removeChild(sample);

              // Guard: nếu CSS chưa apply / đo sai
              if (!Number.isFinite(mainMaxPx) || mainMaxPx < 50) mainMaxPx = 1000;

              const makePage = () => {
                const page = document.createElement("div");
                page.className = pageClass;
                const cols = document.createElement("div");
                cols.className = modernStyles.columns || "columns";
                const sb = document.createElement("div");
                sb.className = modernStyles.sidebar || "sidebar";
                const mn = document.createElement("div");
                mn.className = modernStyles.main || "main";
                cols.appendChild(sb);
                cols.appendChild(mn);
                page.appendChild(cols);
                return page;
              };

              // Seed sidebar (loại bỏ id để không trùng trên nhiều trang)
              const sidebarSeed = leftEl.cloneNode(true);
              sidebarSeed.removeAttribute("id");

              paginateTwoCols(
                sidebarSeed, // dùng seed thay vì leftEl gốc cho mọi trang
                rightEl,
                targetEl,
                makePage,
                mainMaxPx
              );
              console.timeEnd("paginate");
              cancel();
              return;
            }

            // ====== Classic / Minimalist (một cột) ======
            const sourceEl = sourceRef.current;
            if (!sourceEl) return cancel();

            const sample = document.createElement("div");
            sample.className = pageClass;
            // kích hoạt layout
            sample.innerHTML = '<div style="height:0"></div>';
            sample.style.visibility = "hidden";
            sample.style.pointerEvents = "none";
            targetEl.appendChild(sample);

            let pageInnerMaxHeightPx = sample.clientHeight;
            targetEl.removeChild(sample);

            if (!Number.isFinite(pageInnerMaxHeightPx) || pageInnerMaxHeightPx < 50) {
              // fallback cứng ~A4
              pageInnerMaxHeightPx = 1212;
            }

            let createdPages = 0;
            const getPage = () => {
              if (createdPages >= MAX_PAGES)
                throw new Error("Pagination hard limit reached");
              const page = document.createElement("div");
              page.className = pageClass;
              createdPages++;
              return page;
            };

            paginateByHeight(sourceEl, targetEl, getPage, pageInnerMaxHeightPx);
            console.timeEnd("paginate");
          } catch (e) {
            console.error("paginate error", e);
          } finally {
            cancel();
          }
        });
      } catch {
        cancel();
      }
    }, [
      resume,
      headerDisplayType,
      lineHeight,
      subTitleFontSize,
      contentFontSize,
      titleFontSize,
      pageClass,
      templateName,
    ]);

    if (TemplateComp) {
      return (
        <TemplateComp
          sourceRef={sourceRef}
          pagesRef={pagesRef}
          comparePadding={comparePadding}
          compareMargin={compareMargin}
          isBgForPageScroll={isBgForPageScroll}
          pageScrollHeight={pageScrollHeight}
          textColor={textColor}
          contentFontSize={contentFontSize}
          titleFontSize={titleFontSize}
          lineHeight={lineHeight}
          subTitleFontSize={subTitleFontSize}
          ref={ref}
        >
          {templateName === "Modern" ? (
            <div>
              <div id="cv-left" className="block">
                {resume?.basics && (
                  <Header
                    basics={resume.basics}
                    templateName="Modern"
                    region="sidebar"
                  />
                )}
                <SkillSection
                  skills={
                    resume?.sections?.find((s) => s.kind === "skills")?.items || []
                  }
                />
              </div>
              <div id="cv-right" className="block">
                {resume?.basics && (
                  <Header basics={resume.basics} templateName="Modern" region="main" />
                )}
                {resume?.sections
                  ?.filter((s) => s.kind !== "skills")
                  .map((section) => {
                    const sectionName = section.title;
                    const sectionComponent = sectionMap[sectionName];
                    return (
                      sectionComponent &&
                      React.cloneElement(sectionComponent, {
                        key: section.id || section.title,
                      })
                    );
                  })}
              </div>
            </div>
          ) : (
            <>
              {resume?.basics && (
                <Header
                  basics={resume.basics}
                  headerDisplayType={headerDisplayType}
                  templateName={templateName}
                />
              )}
              {resume?.sections?.map((section) => {
                const sectionName = section.title;
                const sectionComponent = sectionMap[sectionName];
                return (
                  sectionComponent &&
                  React.cloneElement(sectionComponent, {
                    key: section.id || section.title,
                  })
                );
              })}
            </>
          )}
        </TemplateComp>
      );
    }

    return (
      <div id="cv-container">
        {/* Nguồn: offscreen để đo & clone */}
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
          {resume?.basics && (
            <Header basics={resume.basics} headerDisplayType={headerDisplayType} />
          )}

          {resume?.sections?.map((section) => {
            const sectionName = section.title;
            const sectionComponent = sectionMap[sectionName];
            return (
              sectionComponent &&
              React.cloneElement(sectionComponent, {
                key: section.id || section.title,
              })
            );
          })}
        </div>

        {/* Cột cuộn dọc (một cột, scroll Y) */}
        <div
          className="pages-scroll"
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
            className="pages"
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
);

/* ========= Phân trang có tách section/element/text ========= */

function paginateByHeight(sourceEl, targetEl, getPage, pageInnerMaxHeightPx) {
  if (!sourceEl || !targetEl) return;

  targetEl.innerHTML = ""; // xóa cũ

  let currentPage = getPage();
  targetEl.appendChild(currentPage);

  const blocks = Array.from(sourceEl.children); // mỗi section là 1 .block
  for (const block of blocks) {
    const node = block.cloneNode(true);
    node.removeAttribute("id");
    currentPage = appendOrPaginate(
      node,
      currentPage,
      getPage,
      targetEl,
      pageInnerMaxHeightPx
    );
  }
}

function fits(pageEl, limitPx) {
  return pageEl.scrollHeight <= limitPx + 0.5;
}

/**
 * Cố gắng thêm node vào currentPage. Nếu tràn:
 * - ELEMENT: tách theo childNodes (đệ quy)
 * - TEXT_NODE: tách nhị phân theo ký tự
 */
function appendOrPaginate(node, currentPage, makePage, target, limitPx) {
  currentPage.appendChild(node);
  if (fits(currentPage, limitPx)) return currentPage;

  currentPage.removeChild(node);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const shell = node.cloneNode(false);
    currentPage.appendChild(shell);

    if (!fits(currentPage, limitPx)) {
      currentPage.removeChild(shell);
      currentPage = makePage();
      target.appendChild(currentPage);
      currentPage.appendChild(shell);
    }

    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.nodeType === Node.TEXT_NODE) {
        currentPage = appendTextNodeSplit(
          child,
          shell,
          currentPage,
          makePage,
          target,
          limitPx
        );
      } else {
        const childClone = child.cloneNode(true);
        childClone.removeAttribute?.("id");
        shell.appendChild(childClone);

        if (!fits(currentPage, limitPx)) {
          shell.removeChild(childClone);

          const tag = childClone.tagName ? childClone.tagName.toLowerCase() : "";
          const isListLike =
            tag === "ul" ||
            (childClone.classList && childClone.classList.contains("sectionContent"));

          if (isListLike) {
            let runContainer = childClone.cloneNode(false);
            shell.appendChild(runContainer);
            const parts = Array.from(childClone.childNodes).map((n) =>
              n.cloneNode(true)
            );

            for (const part of parts) {
              runContainer.appendChild(part);
              if (!fits(currentPage, limitPx)) {
                runContainer.removeChild(part);
                currentPage = makePage();
                target.appendChild(currentPage);
                const nextShell = node.cloneNode(false);
                currentPage.appendChild(nextShell);
                runContainer = childClone.cloneNode(false);
                nextShell.appendChild(runContainer);
                runContainer.appendChild(part);
              }
            }

            for (let j = i + 1; j < children.length; j++) {
              const sib = children[j].cloneNode(true);
              currentPage = appendOrPaginate(
                sib,
                currentPage,
                makePage,
                target,
                limitPx
              );
            }
            return currentPage;
          }

          currentPage = makePage();
          target.appendChild(currentPage);
          const shellNext = node.cloneNode(false);
          currentPage.appendChild(shellNext);
          currentPage = appendOrPaginate(
            childClone,
            currentPage,
            makePage,
            target,
            limitPx
          );

          for (let j = i + 1; j < children.length; j++) {
            const sib = children[j].cloneNode(true);
            currentPage = appendOrPaginate(
              sib,
              currentPage,
              makePage,
              target,
              limitPx
            );
          }
          return currentPage;
        }
      }
    }
    return currentPage;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const span = document.createElement("span");
    span.style.whiteSpace = "pre-wrap";
    span.style.wordBreak = "break-word";
    currentPage.appendChild(span);

    const text = node.nodeValue || "";
    let lo = 0,
      hi = text.length,
      ok = 0,
      steps = 0;
    while (lo <= hi) {
      if (++steps > MAX_SPLIT_STEPS) break;
      const mid = (lo + hi) >> 1;
      span.textContent = text.slice(0, mid);
      if (fits(currentPage, limitPx)) {
        ok = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    span.textContent = text.slice(0, ok);

    if (ok < text.length) {
      let rest = text.slice(ok);
      while (rest.length) {
        const newPage = makePage();
        target.appendChild(newPage);
        const span2 = document.createElement("span");
        span2.style.whiteSpace = "pre-wrap";
        span2.style.wordBreak = "break-word";
        newPage.appendChild(span2);
        let lo2 = 0,
          hi2 = rest.length,
          ok2 = 0,
          steps2 = 0;
        while (lo2 <= hi2) {
          if (++steps2 > MAX_SPLIT_STEPS) break;
          const mid2 = (lo2 + hi2) >> 1;
          span2.textContent = rest.slice(0, mid2);
          if (fits(newPage, limitPx)) {
            ok2 = mid2;
            lo2 = mid2 + 1;
          } else {
            hi2 = mid2 - 1;
          }
        }
        span2.textContent = rest.slice(0, ok2);
        rest = rest.slice(ok2);
        currentPage = newPage;
      }
    }
    return currentPage;
  }

  const newPage = makePage();
  target.appendChild(newPage);
  newPage.appendChild(node);
  return newPage;
}

function appendTextNodeSplit(
  textNode,
  containerEl,
  currentPage,
  makePage,
  target,
  limitPx
) {
  const tmp = document.createElement("span");
  tmp.style.whiteSpace = "pre-wrap";
  tmp.style.wordBreak = "break-word";
  containerEl.appendChild(tmp);

  const text = textNode.nodeValue || "";
  let lo = 0,
    hi = text.length,
    ok = 0,
    steps = 0;

  while (lo <= hi) {
    if (++steps > MAX_SPLIT_STEPS) break;
    const mid = (lo + hi) >> 1;
    tmp.textContent = text.slice(0, mid);
    if (fits(currentPage, limitPx)) {
      ok = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  tmp.textContent = text.slice(0, ok);

  if (ok < text.length) {
    let rest = text.slice(ok);
    while (rest.length) {
      currentPage = makePage();
      target.appendChild(currentPage);

      const span = document.createElement("span");
      span.style.whiteSpace = "pre-wrap";
      span.style.wordBreak = "break-word";
      currentPage.appendChild(span);

      let lo2 = 0,
        hi2 = rest.length,
        ok2 = 0,
        steps2 = 0;
      while (lo2 <= hi2) {
        if (++steps2 > MAX_SPLIT_STEPS) break;
        const mid2 = (lo2 + hi2) >> 1;
        span.textContent = rest.slice(0, mid2);
        if (fits(currentPage, limitPx)) {
          ok2 = mid2;
          lo2 = mid2 + 1;
        } else {
          hi2 = mid2 - 1;
        }
      }
      span.textContent = rest.slice(0, ok2);
      rest = rest.slice(ok2);
    }
  }
  return currentPage;
}

// ========== Modern: two-column pagination (sidebar + main) ==========
function paginateTwoCols(sidebarSeed, sourceRightEl, targetEl, makePage, mainMaxHeightPx) {
  if (!sidebarSeed || !sourceRightEl || !targetEl) return;
  targetEl.innerHTML = "";

  let createdPages = 0;
  const makePageWithSidebar = () => {
    if (createdPages >= MAX_PAGES) throw new Error("Pagination hard limit reached");
    const newPage = makePage();
    const sb =
      newPage.querySelector(`.${modernStyles?.sidebar || "sidebar"}`) ||
      newPage.querySelector(".sidebar");
    if (sb) sb.appendChild(sidebarSeed.cloneNode(true));
    createdPages++;
    return newPage;
  };

  // Create first page
  let page = makePageWithSidebar();
  targetEl.appendChild(page);
  const firstMain =
    page.querySelector(`.${modernStyles?.main || "main"}`) ||
    page.querySelector(".main");

  let currentMain = firstMain;
  const blocks = Array.from(sourceRightEl.children);
  for (const block of blocks) {
    const node = block.cloneNode(true);
    node.removeAttribute("id");
    currentMain = appendOrPaginateModern(
      node,
      currentMain,
      makePageWithSidebar,
      targetEl,
      mainMaxHeightPx
    );
  }
}

function fitsModern(mainEl, limitPx) {
  return mainEl.scrollHeight <= limitPx + 0.5;
}

function appendOrPaginateModern(node, currentMain, makePage, target, limitPx) {
  currentMain.appendChild(node);
  if (fitsModern(currentMain, limitPx)) return currentMain;

  currentMain.removeChild(node);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const shell = node.cloneNode(false);
    currentMain.appendChild(shell);

    if (!fitsModern(currentMain, limitPx)) {
      currentMain.removeChild(shell);
      const newPage = makePage();
      target.appendChild(newPage);
      const nextMain =
        newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
        newPage.querySelector(".main");
      nextMain.appendChild(shell);
      currentMain = nextMain;
    }

    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === Node.TEXT_NODE) {
        currentMain = appendTextNodeSplitModern(
          child,
          shell,
          currentMain,
          makePage,
          target,
          limitPx
        );
      } else {
        const childClone = child.cloneNode(true);
        childClone.removeAttribute?.("id");
        shell.appendChild(childClone);

        if (!fitsModern(currentMain, limitPx)) {
          shell.removeChild(childClone);

          const tag = childClone.tagName ? childClone.tagName.toLowerCase() : "";
          const isListLike =
            tag === "ul" ||
            (childClone.classList && childClone.classList.contains("sectionContent"));

          if (isListLike) {
            let runContainer = childClone.cloneNode(false);
            shell.appendChild(runContainer);
            const parts = Array.from(childClone.childNodes).map((n) =>
              n.cloneNode(true)
            );
            for (const part of parts) {
              runContainer.appendChild(part);
              if (!fitsModern(currentMain, limitPx)) {
                runContainer.removeChild(part);
                const newPage = makePage();
                target.appendChild(newPage);
                const nextMain =
                  newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
                  newPage.querySelector(".main");
                const nextShell = node.cloneNode(false);
                nextMain.appendChild(nextShell);
                runContainer = childClone.cloneNode(false);
                nextShell.appendChild(runContainer);
                runContainer.appendChild(part);
                currentMain = nextMain;
              }
            }

            for (let j = i + 1; j < children.length; j++) {
              const sib = children[j].cloneNode(true);
              currentMain = appendOrPaginateModern(
                sib,
                currentMain,
                makePage,
                target,
                limitPx
              );
            }
            return currentMain;
          }

          const newPage = makePage();
          target.appendChild(newPage);
          const nextMain =
            newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
            newPage.querySelector(".main");
          currentMain = appendOrPaginateModern(
            childClone,
            nextMain,
            makePage,
            target,
            limitPx
          );

          for (let j = i + 1; j < children.length; j++) {
            const sib = children[j].cloneNode(true);
            currentMain = appendOrPaginateModern(
              sib,
              currentMain,
              makePage,
              target,
              limitPx
            );
          }
          return currentMain;
        }
      }
    }
    return currentMain;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const span = document.createElement("span");
    span.style.whiteSpace = "pre-wrap";
    span.style.wordBreak = "break-word";
    currentMain.appendChild(span);
    const text = node.nodeValue || "";
    let lo = 0,
      hi = text.length,
      ok = 0,
      steps = 0;
    while (lo <= hi) {
      if (++steps > MAX_SPLIT_STEPS) break;
      const mid = (lo + hi) >> 1;
      span.textContent = text.slice(0, mid);
      if (fitsModern(currentMain, limitPx)) {
        ok = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    span.textContent = text.slice(0, ok);
    if (ok < text.length) {
      let rest = text.slice(ok);
      while (rest.length) {
        const newPage = makePage();
        target.appendChild(newPage);
        const nextMain =
          newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
          newPage.querySelector(".main");
        const span2 = document.createElement("span");
        span2.style.whiteSpace = "pre-wrap";
        span2.style.wordBreak = "break-word";
        nextMain.appendChild(span2);
        let lo2 = 0,
          hi2 = rest.length,
          ok2 = 0,
          steps2 = 0;
        while (lo2 <= hi2) {
          if (++steps2 > MAX_SPLIT_STEPS) break;
          const mid2 = (lo2 + hi2) >> 1;
          span2.textContent = rest.slice(0, mid2);
          if (fitsModern(nextMain, limitPx)) {
            ok2 = mid2;
            lo2 = mid2 + 1;
          } else {
            hi2 = mid2 - 1;
          }
        }
        span2.textContent = rest.slice(0, ok2);
        rest = rest.slice(ok2);
        currentMain = nextMain;
      }
    }
    return currentMain;
  }

  const newPage = makePage();
  target.appendChild(newPage);
  const mainNext =
    newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
    newPage.querySelector(".main");
  mainNext.appendChild(node);
  return mainNext;
}

function appendTextNodeSplitModern(
  textNode,
  containerEl,
  currentMain,
  makePage,
  target,
  limitPx
) {
  const tmp = document.createElement("span");
  tmp.style.whiteSpace = "pre-wrap";
  tmp.style.wordBreak = "break-word";
  containerEl.appendChild(tmp);
  const text = textNode.nodeValue || "";
  let lo = 0,
    hi = text.length,
    ok = 0,
    steps = 0;
  while (lo <= hi) {
    if (++steps > MAX_SPLIT_STEPS) break;
    const mid = (lo + hi) >> 1;
    tmp.textContent = text.slice(0, mid);
    if (fitsModern(currentMain, limitPx)) {
      ok = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  tmp.textContent = text.slice(0, ok);
  if (ok < text.length) {
    let rest = text.slice(ok);
    while (rest.length) {
      const newPage = makePage();
      target.appendChild(newPage);
      const nextMain =
        newPage.querySelector(`.${modernStyles?.main || "main"}`) ||
        newPage.querySelector(".main");
      const span = document.createElement("span");
      span.style.whiteSpace = "pre-wrap";
      span.style.wordBreak = "break-word";
      nextMain.appendChild(span);
      let lo2 = 0,
        hi2 = rest.length,
        ok2 = 0,
        steps2 = 0;
      while (lo2 <= hi2) {
        if (++steps2 > MAX_SPLIT_STEPS) break;
        const mid2 = (lo2 + hi2) >> 1;
        span.textContent = rest.slice(0, mid2);
        if (fitsModern(nextMain, limitPx)) {
          ok2 = mid2;
          lo2 = mid2 + 1;
        } else {
          hi2 = mid2 - 1;
        }
      }
      span.textContent = rest.slice(0, ok2);
      rest = rest.slice(ok2);
      currentMain = nextMain;
    }
  }
  return currentMain;
}

export default Resume;
