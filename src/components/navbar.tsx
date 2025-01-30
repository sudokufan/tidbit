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
      className="text-gray-200 px-8 items-baseline bg-burgundy"
      classNames={{wrapper: "px-0"}}
    >
      <NavbarContent>
        <NavbarBrand>
          <span className="font-semibold text-gold text-xl">tidbit</span>
        </NavbarBrand>
        <h1 className="sm:hidden block w-full text-center">{getPageTitle()}</h1>

        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        />
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link
            className={getLinkClass("/dashboard", "text-gray-200")}
            href="/dashboard"
          >
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings/connections", "text-gray-200")}
            href="/settings/connections"
          >
            Connections
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings/invite", "text-gray-200")}
            href="/settings/invite"
          >
            Invite
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className={getLinkClass("/settings", "text-gray-200")}
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
