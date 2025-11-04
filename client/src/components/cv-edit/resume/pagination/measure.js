import { HEIGHT_FALLBACK_MAIN, HEIGHT_FALLBACK_PAGE } from "./constants.js";

export function measureModernMainHeight(targetEl, pageClass, styles) {
  // Dựng skeleton đúng cấu trúc để đo chiều cao vùng main
  const sample = document.createElement("div");
  sample.className = pageClass;

  const columns = document.createElement("div");
  columns.className = styles.columns || "columns";

  const sidebar = document.createElement("div");
  sidebar.className = styles.sidebar || "sidebar";

  const main = document.createElement("div");
  main.className = styles.main || "main";
  main.innerHTML = '<div style="height:0"></div>';

  columns.appendChild(sidebar);
  columns.appendChild(main);
  sample.appendChild(columns);
  sample.style.visibility = "hidden";
  sample.style.pointerEvents = "none";
  targetEl.appendChild(sample);

  let h = main.clientHeight;
  targetEl.removeChild(sample);

  // Nếu đo sai (rất nhỏ), đo theo chiều cao page trừ padding
  if (!Number.isFinite(h) || h < 50) {
    const pageProbe = document.createElement("div");
    pageProbe.className = pageClass;
    pageProbe.style.visibility = "hidden";
    pageProbe.style.pointerEvents = "none";
    targetEl.appendChild(pageProbe);
    const cs = getComputedStyle(pageProbe);
    const pad =
      parseFloat(cs.paddingTop || 0) + parseFloat(cs.paddingBottom || 0);
    const hh = pageProbe.clientHeight - pad;
    targetEl.removeChild(pageProbe);
    h = Number.isFinite(hh) && hh > 50 ? hh : h;
  }

  // Fallback cuối
  if (!Number.isFinite(h) || h < 50) h = HEIGHT_FALLBACK_MAIN; // 1000
  return h;
}

export function measurePageInnerHeight(targetEl, pageClass) {
  // Đo chiều cao khả dụng của 1 trang (nội dung bên trong .page)
  const sample = document.createElement("div");
  sample.className = pageClass;
  sample.innerHTML = '<div style="height:0"></div>';
  sample.style.visibility = "hidden";
  sample.style.pointerEvents = "none";
  targetEl.appendChild(sample);

  let h = sample.clientHeight;
  targetEl.removeChild(sample);

  if (!Number.isFinite(h) || h < 50) h = HEIGHT_FALLBACK_PAGE; // 1212
  return h;
}
