import { 
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";
import { useContext, useEffect, useState } from "react"
import CVContext from "/src/components/cv-edit/CVContext";
import { SkillIcon, ProjectIcon, EduIcon, ExpIcon, UserIcon } from "../../../libs/icons";
import styles from "./SectionList.module.css"

export default function SectionList({ selectedSection, setSelectedSection, initialItems }) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const { setResumeData } = useContext(CVContext)

    console.log('SectionList:',items)

    const handleOnDragStart = () => {
        setSelectedSection(null);
    }

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        setItems(newItems);
        setResumeData(prev => {
            const reorderedSections = newItems.map(item =>
                prev.sections.find(section => section.id === item.id)
            ).filter(Boolean)

            return {
                ...prev,
                sections: reorderedSections
            };
        });
    }

    const handleSeclectionClick = (section) => {
        setSelectedSection(prev => (prev?.id === section.id ? null : section ))
    }

    function getIconBySectionId(id, color) {
        const size = 24
        switch (id) {
            case "education":
                return <EduIcon size={size} color={color} />
            case "experience":
                return <ExpIcon size={size} color={color} />
            case "projects":
                return <ProjectIcon size={size} color={color} />
            case "skills":
                return <SkillIcon size={size} color={color} />
            default:
                return null;
        }
    }

    const deleteSection = (id) => {
        // (tuỳ chọn) chặn xóa các section cố định
        if (id === "basics") return;

        // Xác nhận
        if (!window.confirm("Delete this section?")) return;

        setSelectedSection(prev => (prev?.id === id ? null : prev));  

        // 1) Cập nhật danh sách hiển thị tại chỗ
        setItems(prevItems => prevItems.filter(it => it.id !== id));

        // 2) Cập nhật dữ liệu toàn cục trong resumeData
        setResumeData(prev => {
            if (!prev) return prev;
            const nextSections = (prev.sections ?? []).filter(sec => sec.id !== id);
            return { ...prev, sections: nextSections };
        });

        // 3) Nếu đang chọn section vừa xóa → bỏ chọn
      
    }

    return(
        <div>
            <div
                style={{
                        userSelect: "none",
                        padding: 16,
                        margin: "0 0 8px 0",
                        background: selectedSection?.id === 'basics' ? "var(--secondary)" : "#fff",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'end',
                        gap: 24,
                    }}
                onClick={() => handleSeclectionClick({ id: 'basics', title: 'Basics' })}
                className={styles.nonDraggableItem}
            >
                <UserIcon size={24} color={'black'} />
                <span>Basics</span>
            </div>
            <DragDropContext 
                onDragStart={handleOnDragStart}
                onDragEnd={handleOnDragEnd}
            >
                <Droppable droppableId="droppable-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            // style={{ padding: 20, background: '#f0f0f0', width: 300, height: 400 }}
                        >
                            {items.map((item, index) => {
                                const isSelected = selectedSection?.id === item.id;
                                return (
                                    <Draggable key={item.id} draggableId={item.id} index={index} >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    userSelect: "none",
                                                    margin: "0 0 8px 0",
                                                    background: isSelected
                                                        ? "var(--secondary)"
                                                        : (snapshot.isDragging ? "var(--primary)" : "#fff"),
                                                    color: snapshot.isDragging ? "#fff" : "#313131",
                                                    border: "1px solid #ccc",
                                                    borderRadius: 8,
                                                    ...provided.draggableProps.style,
                                                }}
                                                className={styles.draggableItem}
                                                onClick={() => handleSeclectionClick(item)}
                                            >                
                                                <div className={styles.flexTitleContainer}>
                                                    <div className={styles.titleAndIcon}>
                                                        {getIconBySectionId(item.id, snapshot.isDragging ? "#fff" : "#313131")}
                                                        <span>{item.title}</span>
                                                    </div>

                                                    <ButtonDelete 
                                                        iconSize={20} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();   // ⬅️ chặn sự kiện nổi bọt
                                                            deleteSection(item.id);
                                                        }}
                                                    />                                                    
                                                </div>                   

                                            </div>
                                        )}
                                    </Draggable>
                                )
                                
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
        
    )
}

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