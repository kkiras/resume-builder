// Re-export utilities and engines so template modules can be self-contained
export { fitsByScroll, cloneAsShell, isListLike, removeIdsDeep } from "../../cv-edit/resume/pagination/dom";
export { splitTextInto } from "../../cv-edit/resume/pagination/splitText";
export { measureModernMainHeight, measurePageInnerHeight } from "../../cv-edit/resume/pagination/measure";
export { paginateByHeight } from "../../cv-edit/resume/pagination/oneColumn";
export { paginateTwoCols as paginateTwoColsEngine } from "../../cv-edit/resume/pagination/twoColumns";

