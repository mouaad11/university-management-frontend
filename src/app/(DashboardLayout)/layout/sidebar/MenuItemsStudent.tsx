import {
  IconAperture,
  IconCopy,
  IconDoorExit,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const MenuItemsAdmin = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Tableau de bord",
    icon: IconLayoutDashboard,
    href: "/",
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
  },
  {
    id: uniqueId(),
    title: "Créer un nouveau compte",
    icon: IconUserPlus,
    href: "/authentication/register",
  },

  
];
export default MenuItemsAdmin;
