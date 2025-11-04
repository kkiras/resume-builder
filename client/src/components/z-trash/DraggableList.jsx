import { useEffect, useRef, memo } from "react";
import { useSprings, animated, to } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import clamp from "lodash.clamp";
import swap from "lodash-move";

import styles from "./styles.module.css";

// Compute spring target styles for each item based on order and drag state
const fn = (
  order,
  active = false,
  originalIndex = 0,
  curIndex = 0,
  y = 0,
  ITEM_HEIGHT = 150
) => (index) =>
  active && index === originalIndex
    ? {
        y: curIndex * ITEM_HEIGHT + y,
        scale: 1.02,
        zIndex: 1,
        shadow: 15,
        immediate: (key) => key === "y" || key === "zIndex",
      }
    : {
        y: order.indexOf(index) * ITEM_HEIGHT,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
      };

const DraggableList = memo(({ items, order, setSelectedSection, setCVOrder }) => {
  // Keep in sync with CSS item height
  const ITEM_HEIGHT = 50;

  const [springs, api] = useSprings(
    items.length,
    fn(order.current, false, 0, 0, 0, ITEM_HEIGHT)
  );

  // Distinguish drag vs click
  const wasDragging = useRef(false);

  // When items prop order changes (e.g., after parent setItems), reset mapping
  // useEffect(() => {
  //   order.current = items.map((_, index) => index);
  //   api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT));
  // }, [items, api]);

  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [, y] }) => {
      if (active) wasDragging.current = true;

      const curIndex = order.current.indexOf(originalIndex);
      const deltaRows = Math.round(y / ITEM_HEIGHT);
      const targetIndex = clamp(curIndex + deltaRows, 0, items.length - 1);
      const newOrder = swap(order.current, curIndex, targetIndex);

      // Animate during drag
      api.start(fn(newOrder, active, originalIndex, curIndex, y, ITEM_HEIGHT));

      if (!active) {
        // Commit order on release
        order.current = newOrder;
        setCVOrder(newOrder)
        // setTimeout(() => {
        //   api.start(fn(order.current, false, 0, 0, 0, ITEM_HEIGHT));
        //   const newItemsOrder = order.current.map((index) => items[index]);
        //   setItems(newItemsOrder);
        // }, 200)

        // Reset drag flag after release to allow next click
        setTimeout(() => {
          wasDragging.current = false;
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
    setSelectedSection(item);
    console.log(item.toLowerCase())
  };

  return (
    <div className={styles.content} style={{ height: items.length * ITEM_HEIGHT }}>
      {springs.map(({ zIndex, shadow, y, scale }, i) => (
        <animated.div
          {...bind(i)}
          key={items[i]}
          onClick={(e) => handleClick(items[i], e)}
          style={{
            zIndex,
            boxShadow: shadow.to(
              (s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
            ),
            transform: to([y, scale], (py, s) => `translate3d(0, ${py}px, 0) scale(${s})`),
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          {svg()}

          {/* Thêm icon hoặc tag */}
          <div className={styles.abc}>{items[i]}</div>
        </animated.div>
      ))}
    </div>
  );
});

export default DraggableList;



const svg = () => (
  <svg fill="#000000" width="24px" height="24px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <path d="M600 1440c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240ZM600 720c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240 107.64-240 240-240ZM600 0c132.36 0 240 107.64 240 240S732.36 480 600 480 360 372.36 360 240 467.64 0 600 0Zm720 0c132.36 0 240 107.64 240 240s-107.64 240-240 240-240-107.64-240-240S1187.64 0 1320 0Z" fillRule="evenodd"></path> 
    </g>
  </svg>

)
