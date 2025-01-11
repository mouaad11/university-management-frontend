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
    subheader: "Auth",
  },
  /*
  {
    id: uniqueId(),
    title: "Se déconnecter",
    icon: IconDoorExit,
    href: "#",
  },
  */
  {
    id: uniqueId(),
    title: "S'authentifier",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Créer un nouveau compte",
    icon: IconUserPlus,
    href: "/authentication/register",
  },

  
];

export default MenuItemsAdmin;
