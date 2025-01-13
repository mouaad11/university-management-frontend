import { IconDoorExit } from "@tabler/icons-react";
import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";
import router from "next/router";
const handleLogout = () => {
  localStorage.removeItem("token"); // Clear the JWT token
  router.push("/authentication/login"); // Redirect to the login page
};
const MenuItemsAdmin = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: uniqueId(),
    title: "Tableau de bord",
    icon: IconLayoutDashboard,
    href: "/admin",
  },
  {
    navlabel: true,
    subheader: "Tables",
  },
  {
    id: uniqueId(),
    title: "Étudiants",
    icon: IconAperture, // Replace with an appropriate icon
    href: "/admin/students",
  },
  {
    id: uniqueId(),
    title: "Professeurs",
    icon: IconMoodHappy, // Replace with an appropriate icon
    href: "/admin/professors",
  },
  {
    id: uniqueId(),
    title: "Horaires",
    icon: IconCopy, // Replace with an appropriate icon
    href: "/admin/schedules",
  },
  {
    id: uniqueId(),
    title: "Salles",
    icon: IconTypography, // Replace with an appropriate icon
    href: "/admin/rooms",
  },
  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "Se déconnecter",
    icon: IconDoorExit,
    href: "/authentication/login",
    onClick: handleLogout, // Add onClick handler for logout
  },
  {
    id: uniqueId(),
    title: "Créer un nouveau compte",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
];

export default MenuItemsAdmin;