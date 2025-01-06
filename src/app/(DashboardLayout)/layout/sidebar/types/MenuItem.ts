import { TablerIconsProps } from "@tabler/icons-react"; // Import TablerIconsProps if needed

export interface MenuItem {
  navlabel?: boolean; // Optional: Indicates if the item is a navigation label
  subheader?: string; // Optional: Subheader text
  id?: string; // Optional: Unique identifier
  title?: string; // Optional: Display text
  icon?: (props: TablerIconsProps) => JSX.Element; // Optional: Icon component
  href?: string; // Optional: URL for navigation
}