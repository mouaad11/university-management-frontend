"use client";
import { useState, useEffect } from "react";

const RoleBasedLayout = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decodedToken.role);
    }
  }, []);
/*
  const renderSidebar = () => {
    switch (userRole) {
      case "ROLE_ADMIN":
        return <AdminSidebar />;
      case "ROLE_STUDENT":
        return <StudentSidebar />;
      case "ROLE_PROFESSOR":
        return <ProfessorSidebar />;
      default:
        return null;
    }
  };*/

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export default RoleBasedLayout;