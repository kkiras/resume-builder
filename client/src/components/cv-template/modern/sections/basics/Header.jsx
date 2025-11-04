import { useEffect, useMemo } from "react";
import { LocationIcon, CalendarIcon, MailIcon, PhoneIcon } from "../../../../../libs/icons";
import styles from "./styles.modern.module.css";

export default function Header({ basics, headerDisplayType, region }) {
  // const iconSize = 18;
  // const iconColor = "currentColor";

  // useEffect(() => {
  //   console.log("Header:", headerDisplayType);
  // }, [headerDisplayType]);

  // function getCVHeaderDisplayType(type) {
  //   switch (type) {
  //     case "left":
  //       return { display: "flex", justifyContent: "space-between", marginBottom: 36 };
  //     case "mid":
  //       return { display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 24 };
  //     case "right":
  //       return { display: "flex", justifyContent: "space-between", marginBottom: 36, flexDirection: "row-reverse" };
  //     default:
  //       return {};
  //   }
  // }

  // function getPersonalDisplayType(type) {
  //   switch (type) {
  //     case "left":
  //       return { flexBasis: "40%", display: "flex", gap: "18px", height: "fit-content" };
  //     case "mid":
  //       return { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 8 };
  //     case "right":
  //       return { flexBasis: "40%", display: "flex", gap: "18px", height: "fit-content" };
  //     default:
  //       return {};
  //   }
  // }

  // function getContactDisplayType(type) {
  //   switch (type) {
  //     case "left":
  //       return { flexBasis: "55%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignSelf: "center" };
  //     case "mid":
  //       return { display: "flex", justifyContent: "center", gap: 24 };
  //     case "right":
  //       return { flexBasis: "55%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignSelf: "center" };
  //     default:
  //       return {};
  //   }
  // }

  // function getNameRoleDisplayType(type) {
  //   switch (type) {
  //     case "left":
  //       return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" };
  //     case "mid":
  //       return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", alignItems: "center" };
  //     case "right":
  //       return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" };
  //     default:
  //       return {};
  //   }
  // }

  // const headerStyle = useMemo(() => getCVHeaderDisplayType(headerDisplayType), [headerDisplayType]);
  // const personalStyle = useMemo(() => getPersonalDisplayType(headerDisplayType), [headerDisplayType]);
  // const contactStyle = useMemo(() => getContactDisplayType(headerDisplayType), [headerDisplayType]);
  // const nameRoleStyle = useMemo(() => getNameRoleDisplayType(headerDisplayType), [headerDisplayType]);

  // const avatar = useMemo(() => {
  //   const base = {
  //     objectFit: "cover",
  //     objectPosition: "center",
  //     display: "block",
  //     flexShrink: 0,
  //     borderRadius: 8,
  //     backgroundColor: "#e9e9e9",
  //   };
  //   switch (headerDisplayType) {
  //     case "left":
  //       return { ...base, width: 90, height: 120 };
  //     case "mid":
  //       return { ...base, width: 120, height: 120 };
  //     case "right":
  //       return { ...base, width: 90, height: 120 };
  //     default:
  //       return base;
  //   }
  // }, [headerDisplayType]);

  return (
    <div className={styles.basics}>
      {basics?.avatar && (
        <img src={basics.avatar} alt="avatar" className={styles.avatar} />
      )}

      <div className={styles.mainHeader}>
        <h2 className={styles.name}>{basics?.name}</h2>
        <h3 className={styles.role}>{basics?.title}</h3>
      </div>

      <div className={styles.contact}>
        <span className={styles.subTitle} >Contact</span>
        <div className={styles.contactItem}>
          <MailIcon size={18} color={'currentColor'} />
          {basics.email && <span>{basics.email}</span>}
        </div>
        <div className={styles.contactItem}>
          <LocationIcon size={18} color={'currentColor'} />
          {basics.location && <span>{basics.location}</span>}
        </div>
        <div className={styles.contactItem}>
          <PhoneIcon size={18} color={'currentColor'} />
          {basics.phone && <span>{basics.phone}</span>}
        </div>
        <div className={styles.contactItem}>
          <CalendarIcon size={18} color={'currentColor'} />
          {basics.employ && <span>{basics.employ}</span>}
        </div>
      </div>
    </div>
);
}
