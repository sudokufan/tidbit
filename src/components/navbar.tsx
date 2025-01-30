import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@heroui/react";
import {useState} from "react";
import {useLocation} from "react-router-dom";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const getLinkClass = (path: string, defaultColor: string) =>
    currentPath === path ? "text-gold" : defaultColor;

  const getPageTitle = () => {
    switch (currentPath) {
      case "/dashboard":
        return "Dashboard";
      case "/settings/connections":
        return "Connections";
      case "/settings/invite":
        return "Invite";
      case "/settings":
        return "Settings";
      default:
        return "";
    }
  };

  return (
    <HeroUINavbar
      isMenuOpen={isMenuOpen}
      className="text-white items-baseline bg-burgundy"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        />
        <NavbarBrand className="flex flex-row-reverse sm:flex-row justify-between w-full sm:w-auto">
          <span className="sm:hidden flex justify-left sm:justify-center w-full order-2">
            {getPageTitle()}
          </span>
          <span className="font-semibold text-gold text-xl order-1 sm:order-none">
            tidbit
          </span>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link
            className={getLinkClass("/dashboard", "text-white")}
            href="/dashboard"
          >
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings/connections", "text-white")}
            href="/settings/connections"
          >
            Connections
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings/invite", "text-white")}
            href="/settings/invite"
          >
            Invite
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings", "text-white")}
            href="/settings"
          >
            Settings
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <NavbarMenuItem>
          <Link
            onPress={() => setIsMenuOpen(false)}
            className="text-burgundy"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            onPress={() => setIsMenuOpen(false)}
            className="text-burgundy"
            href="/settings/connections"
          >
            Connections
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            onPress={() => setIsMenuOpen(false)}
            className="text-burgundy"
            href="/settings/invite"
          >
            Invite
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            onPress={() => setIsMenuOpen(false)}
            className="text-burgundy"
            href="/settings"
          >
            Settings
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
