import { useEffect, useMemo } from "react";
import { LocationIcon, CalendarIcon, MailIcon, PhoneIcon } from "../../../../libs/icons";
import modernStyles from "./styles.modern.module.css";

export default function Header({ basics, headerDisplayType, templateName, region }) {
  const iconSize = 18;
  const iconColor = "currentColor";

  useEffect(() => {
    console.log("Header:", headerDisplayType);
  }, [headerDisplayType]);

  function getCVHeaderDisplayType(type) {
    switch (type) {
      case "left":
        return { display: "flex", justifyContent: "space-between", marginBottom: 36 };
      case "mid":
        return { display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 24 };
      case "right":
        return { display: "flex", justifyContent: "space-between", marginBottom: 36, flexDirection: "row-reverse" };
      default:
        return {};
    }
  }

  function getPersonalDisplayType(type) {
    switch (type) {
      case "left":
        return { flexBasis: "40%", display: "flex", gap: "18px", height: "fit-content" };
      case "mid":
        return { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 8 };
      case "right":
        return { flexBasis: "40%", display: "flex", gap: "18px", height: "fit-content" };
      default:
        return {};
    }
  }

  function getContactDisplayType(type) {
    switch (type) {
      case "left":
        return { flexBasis: "55%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignSelf: "center" };
      case "mid":
        return { display: "flex", justifyContent: "center", gap: 24 };
      case "right":
        return { flexBasis: "55%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignSelf: "center" };
      default:
        return {};
    }
  }

  function getNameRoleDisplayType(type) {
    switch (type) {
      case "left":
        return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" };
      case "mid":
        return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", alignItems: "center" };
      case "right":
        return { display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" };
      default:
        return {};
    }
  }

  const headerStyle = useMemo(() => getCVHeaderDisplayType(headerDisplayType), [headerDisplayType]);
  const personalStyle = useMemo(() => getPersonalDisplayType(headerDisplayType), [headerDisplayType]);
  const contactStyle = useMemo(() => getContactDisplayType(headerDisplayType), [headerDisplayType]);
  const nameRoleStyle = useMemo(() => getNameRoleDisplayType(headerDisplayType), [headerDisplayType]);

  const avatar = useMemo(() => {
    const base = {
      objectFit: "cover",
      objectPosition: "center",
      display: "block",
      flexShrink: 0,
      borderRadius: 8,
      backgroundColor: "#e9e9e9",
    };
    switch (headerDisplayType) {
      case "left":
        return { ...base, width: 90, height: 120 };
      case "mid":
        return { ...base, width: 120, height: 120 };
      case "right":
        return { ...base, width: 90, height: 120 };
      default:
        return base;
    }
  }, [headerDisplayType]);

  // Modern template: fixed layout, ignore headerDisplayType
  if (templateName === 'Modern') {
    if (region === 'sidebar') {
      return (
        <div className={modernStyles.modernSidebar}>
          {basics?.avatar && (
            <img src={basics.avatar} alt="avatar" className={modernStyles.avatar} />
          )}
          <div className={modernStyles.contact}>
            <div className={modernStyles.contactItem}>
              <MailIcon size={18} color={'currentColor'} />
              {basics.email && <span>{basics.email}</span>}
            </div>
            <div className={modernStyles.contactItem}>
              <LocationIcon size={18} color={'currentColor'} />
              {basics.location && <span>{basics.location}</span>}
            </div>
            <div className={modernStyles.contactItem}>
              <PhoneIcon size={18} color={'currentColor'} />
              {basics.phone && <span>{basics.phone}</span>}
            </div>
            <div className={modernStyles.contactItem}>
              <CalendarIcon size={18} color={'currentColor'} />
              {basics.employ && <span>{basics.employ}</span>}
            </div>
          </div>
        </div>
      );
    }

    // main region (right): name + role
    return (
      <div className={modernStyles.mainHeader}>
        <h2 className={modernStyles.name}>{basics?.name}</h2>
        <h3 className={modernStyles.role}>{basics?.title}</h3>
      </div>
    );
  }

  return (
    <header className="cv-header" style={headerStyle}>
      <div className="personal" style={personalStyle}>
        {basics?.avatar && <img src={basics.avatar} alt="avatar" style={avatar} />}
        <div className="name-role" style={nameRoleStyle}>
          <h2>{basics.name}</h2>
          <h3>{basics.title}</h3>
        </div>
      </div>

      <div className="contact" style={contactStyle}>
        <div>
          <MailIcon size={iconSize} color={iconColor} />
          {basics.email && <span>{basics.email}</span>}
        </div>
        <div>
          <LocationIcon size={iconSize} color={iconColor} />
          {basics.location && <span>{basics.location}</span>}
        </div>
        <div>
          <PhoneIcon size={iconSize} color={iconColor} />
          {basics.phone && <span>{basics.phone}</span>}
        </div>
        <div>
          <CalendarIcon size={iconSize} color={iconColor} />
          {basics.employ && <span>{basics.employ}</span>}
        </div>
      </div>
    </header>
  );
}
