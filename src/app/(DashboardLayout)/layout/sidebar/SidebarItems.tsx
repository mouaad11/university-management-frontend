import React from "react";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import MenuItemsAdmin from "./MenuItemsAdmin";
import MenuItemsStudent from "./MenuItemsStudent";
import MenuItemsProfessor from "./MenuItemsProfessor";
import { MenuItem } from "./types/MenuItem";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;

  // Get the user's role from localStorage
  const token = localStorage.getItem("token");
  const role = token ? JSON.parse(atob(token.split(".")[1])).role[0] : null;

  // Load the correct menu items based on the user's role
  let menuItems: MenuItem[] = []; // Explicitly define the type as MenuItem[]
  switch (role) {
    case "ROLE_ADMIN":
      menuItems = MenuItemsAdmin;
      break;
    case "ROLE_STUDENT":
      menuItems = MenuItemsStudent;
      break;
    case "ROLE_PROFESSOR":
      menuItems = MenuItemsProfessor;
      break;
    default:
      menuItems = []; // No menu items for unauthorized users
  }

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {menuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={toggleMobileSidebar}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;