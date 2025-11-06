import React, { useState, useEffect, useContext } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import EducationItem from "../education/EducationItem";
import ExperienceItem from "../experience/ExperienceItem";
import ProjectItem from "../projects/ProjectItem";
import NewItem from "../new-section/NewItem";
import CVContext from "/src/components/cv-edit/CVContext";
import styles from "./ItemSection.module.css"

function ItemSection({ selectedSection, initialItems }) {
  const { setResumeData } = useContext(CVContext)
  const [items, setItems] = useState(initialItems)
  const [expandedItemId, setExpandedItemId] = useState(null);
    
  //initialItems thay đổi nhưng items k tự cập nhật theo vì useState() chỉ dùng giá trị khởi tạo một lần duy nhất khi component được mount
  // => dùng useEffect để phát hiện sự thay đổi của initialItems
  useEffect(() => { setItems(initialItems); }, [initialItems]);

  //Reset expanded mỗi khi chuyển section
  useEffect(() => { 
    setExpandedItemId(null); 
  }, [selectedSection]);

  console.log('Items passed', items)

  const ItemContainer = (selectedSection, item) => {
    switch(selectedSection) {
      case 'Education':
        return <EducationItem item={item} />;
      case 'Skills':
        return <EducationItem item={item} />;
      case 'Projects':
        return <ProjectItem item={item} />
      case 'Experience':
        return <ExperienceItem item={item} />
      default:
        return <NewItem item={item} />
    }
      
  }

  function handleOnDragEnd(result) {
    const { destination, source } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newItems = Array.from(items);
    const [moved] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, moved);

    setItems(newItems);

    //Thay đổi vị trí của các item trong section
    setResumeData(prev => {
      const updatedSections = prev.sections.map(section => {
        if (section.title === selectedSection) {
          return {
            ...section,
            items: newItems
          };
        }
        return section;
      });

      return {
        ...prev,
        sections: updatedSections
      };
    });
  }

  function getDisplayTitle(item) {
    return (
      item.company ||
      item.name ||
      item.schoolName ||
      'Untitled'
    );
  }

  const toggleExpand = (id) => {
    setExpandedItemId((prevId) => (prevId === id ? null : id));
  };

  const deleteItem = (id) => {
    // Xóa item khỏi mảng hiện tại
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);

    // Đồng bộ lại với resumeData trong context
    setResumeData((prev) => {
      const updatedSections = prev.sections.map((section) => {
        if (section.title === selectedSection) {
          return {
            ...section,
            items: updatedItems,
          };
        }
        return section;
      });

      return {
        ...prev,
        sections: updatedSections,
      };
    });

    // Thu gọn item đang mở nếu vừa xóa nó
    if (expandedItemId === id) {
      setExpandedItemId(null);
    }
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
        <div 
          style={{
            // maxHeight: "400px",
            // overflowY: "auto",
            // border: "2px dashed #999",
            // padding: 8,
          }}
        >
          <Droppable droppableId="droppable-list" >
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                        <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            
                            initial={false}
                            animate={{
                            backgroundColor: snapshot.isDragging
                                ? "#e0e0e0"
                                : expandedItemId === item.id
                                ? "#f9f9f9"
                                : "#fff",
                            }}
                            style={{
                              userSelect: "none",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              marginBottom: 8,
                              cursor: "grab",
                              ...provided.draggableProps.style,
                            }}
                        >
                            <div 
                              onClick={() => toggleExpand(item.id)}
                              className={styles.tiltleContainer}
                            >
                              <span>{getDisplayTitle(item)}</span>  
                              <ButtonDelete iconSize={20} onClick={() => deleteItem(item.id)} />             
                            </div>

                            <AnimatePresence>
                            {/* {expandedItemId === item.id && item.children.length > 0 && ( */}
                            {expandedItemId === item.id && (
                                <motion.div
                                key="children"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    marginTop: 8,
                                    padding: '0px 12px 12px 12px',
                                }}
                                >
                                  {/* {item.children.map((child, idx) => (
                                      // <div key={idx} style={{ marginBottom: 4 }}>
                                      // • {child}
                                      // </div>
                                      <div key={idx} >
                                        
                                      </div>
                                  ))} */}
                                  
                                  {ItemContainer(selectedSection, item)}

                                </motion.div>
                            )}
                            </AnimatePresence>
                        </motion.div>
                        )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

              </div>
            )}
          </Droppable>
        </div>
    </DragDropContext>
  );
}

export default ItemSection;

function ButtonDelete({ iconSize, onClick }) {
  return(
    <div 
      className={styles.btnDelete}
      onClick={onClick}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />{" "}
        </g>
      </svg>
    </div>

  )
}
