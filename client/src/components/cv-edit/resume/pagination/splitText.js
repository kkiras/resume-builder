import { MAX_SPLIT_STEPS } from "./constants.js";
import { fitsByScroll } from "./dom.js";

export function splitTextInto(elContainer, currentHost, limitPx) {
  // elContainer là element sẽ chứa text tạm (span)
  const span = document.createElement("span");
  span.style.whiteSpace = "pre-wrap";
  span.style.wordBreak = "break-word";
  elContainer.appendChild(span);
  return (text) => {
    let lo = 0, hi = text.length, ok = 0, steps = 0;
    while (lo <= hi) {
      if (++steps > MAX_SPLIT_STEPS) break;
      const mid = (lo + hi) >> 1;
      span.textContent = text.slice(0, mid);
      if (fitsByScroll(currentHost, limitPx)) {
        ok = mid; lo = mid + 1;
      } else hi = mid - 1;
    }
    span.textContent = text.slice(0, ok);
    return { used: text.slice(0, ok), rest: text.slice(ok) };
  };
}
