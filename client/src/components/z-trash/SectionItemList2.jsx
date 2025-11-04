import { useEffect, useRef, memo, useState } from "react";
import { useSprings, animated, to } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import clamp from "lodash.clamp";
import swap from "lodash-move";

import styles from "./styles.module.css";

// Compute spring target styles for each item based on order, drag and expanded panel
const fn = (
  order,
  active = false,
  originalIndex = 0,
  curIndex = 0,
  y = 0,
  ITEM_HEIGHT = 150,
  expandedPos = -1,
  expandHeight = 0
) => (index) => {
  const pos = order.indexOf(index);
  const afterExpandedShift = expandedPos >= 0 && pos > expandedPos ? expandHeight : 0;

  if (active && index === originalIndex) {
    const base = curIndex * ITEM_HEIGHT + (expandedPos >= 0 && curIndex > expandedPos ? expandHeight : 0);
    return {
      y: base + y,
      scale: 1.02,
      zIndex: 1,
      shadow: 15,
      immediate: (key) => key === "y" || key === "zIndex",
    };
  }

  return {
    y: pos * ITEM_HEIGHT + afterExpandedShift,
    scale: 1,
    zIndex: 0,
    shadow: 1,
    immediate: false,
  };
};

const SectionItemList2 = memo(({ items, order, setSelectedItem, config, selectedItem }) => {
  // Keep in sync with CSS item height
  const ITEM_HEIGHT = 50;
  // Track expanded panel height to offset items below
  const [expandHeight, setExpandHeight] = useState(0);
  const expandRef = useRef(null);

  const [springs, api] = useSprings(
    items.length,
    fn(order.current, false, 0, 0, 0, ITEM_HEIGHT)
  );

  // Distinguish drag vs click
  const wasDragging = useRef(false);

  const expandedOriginalIndex = selectedItem
    ? items.findIndex((it) => it[config.titleKey] === selectedItem)
    : -1;
  const expandedPos = expandedOriginalIndex >= 0 ? order.current.indexOf(expandedOriginalIndex) : -1;

  // Measure expanded panel height and react to resize
  useEffect(() => {
    if (!selectedItem) {
      setExpandHeight(0);
      api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT, -1, 0));
      return;
    }

    let ro;
    const measureAndApply = () => {
      const h = expandRef.current ? expandRef.current.getBoundingClientRect().height : 0;
      setExpandHeight(h || 0);
      const expandedOriginalIndexLocal = items.findIndex((it) => it[config.titleKey] === selectedItem);
      const expandedPosLocal = expandedOriginalIndexLocal >= 0 ? order.current.indexOf(expandedOriginalIndexLocal) : -1;
      api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT, expandedPosLocal, h || 0));
    };

    // Initial measure after paint
    const id = requestAnimationFrame(measureAndApply);

    // Observe resize of the expanded content
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        measureAndApply();
      });
      if (expandRef.current) ro.observe(expandRef.current);
    }

    return () => {
      cancelAnimationFrame(id);
      if (ro && expandRef.current) ro.unobserve(expandRef.current);
    };
  }, [selectedItem, items, config.titleKey]);

  // Re-apply springs when measured height changes
  useEffect(() => {
    if (!selectedItem) return;
    const expandedOriginalIndexLocal = items.findIndex((it) => it[config.titleKey] === selectedItem);
    const expandedPosLocal = expandedOriginalIndexLocal >= 0 ? order.current.indexOf(expandedOriginalIndexLocal) : -1;
    api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT, expandedPosLocal, expandHeight));
  }, [expandHeight]);

  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [, y] }) => {
      if (active) wasDragging.current = true;

      const curIndex = order.current.indexOf(originalIndex);
      const deltaRows = Math.round(y / ITEM_HEIGHT);
      const targetIndex = clamp(curIndex + deltaRows, 0, items.length - 1);
      const newOrder = swap(order.current, curIndex, targetIndex);

      // Animate during drag
      api.start(fn(newOrder, active, originalIndex, curIndex, y, ITEM_HEIGHT, expandedPos, expandHeight));

      if (!active) {
        // Commit order on release
        order.current = newOrder;
        setTimeout(() => {
          wasDragging.current = false;
          // Ensure final layout accounts for expanded offset
          api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT, expandedPos, expandHeight));
        }, 0);
      }
    },
    { axis: "y", threshold: 6, filterTaps: true }
  );

  const handleClick = (item, e) => {
    if (wasDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setSelectedItem(prev=> prev === item[config.titleKey] ? "" : item[config.titleKey]);
  };

  const containerHeight = items.length * ITEM_HEIGHT + (selectedItem ? expandHeight : 0);

  return (
    <div className={styles.itemContent} style={{ height: containerHeight }}>
      {springs.map(({ zIndex, shadow, y, scale }, i) => (
        <animated.div
          {...bind(i)}
          key={items[i][config.titleKey] ?? i}
          onClick={(e) => handleClick(items[i], e)}
          style={{
            zIndex,
            boxShadow: shadow.to(
              (s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
            ),
            transform: to([y, scale], (py, s) => `translate3d(0, ${py}px, 0) scale(${s})`),
            // display: "flex",
            // justifyContent: "start",
            // alignItems: "center",
            // userSelect: "none",
          }}
        > 
        <div>
          <div className={styles.sectionItemMinimal}>
            {svg()}
            <div className={styles.abc}>{items[i][config.titleKey]}</div>
          </div>
          
          {selectedItem ===  items[i][config.titleKey] ? (
            <div className={styles.sectionItemExpand} ref={expandRef}>
              <label htmlFor="">Company Name:</label>
              <input type="text" value={items[i][config.titleKey]} />

              <label htmlFor="">Position:</label>
              <input type="text" value={items[i][config.subtitleKey]} />

              <label htmlFor="">Employment Period:</label>
              <input type="text" value={items[i][config.periodKey]} />

              <label htmlFor="">Employment Period:</label>
              <input type="text" value={items[i][config.descriptionKey]} />
            </div>
          ): (<></>)}
        </div>

        </animated.div>
      ))}
    </div>
  );
});

export default SectionItemList2;



const svg = () => (
  <svg fill="#000000" width="24px" height="24px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <path d="M600 1440c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240ZM600 720c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240ZM600 0c132.36 0 240 107.64 240 240S732.36 480 600 480 360 372.36 360 240 467.64 0 600 0Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240S1187.64 0 1320 0Z" fillRule="evenodd"></path> 
    </g>
  </svg>

)
