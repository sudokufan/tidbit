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

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HeroUINavbar isMenuOpen={isMenuOpen} className="text-white bg-burgundy">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        />
        <NavbarBrand>
          {/* You can add your logo or brand name here */}
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link className="text-white" href="/dashboard">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white" href="/settings/connections">
            Connections
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white" href="/settings/invite">
            Invite
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white" href="/profile">
            Profile
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
            href="/profile"
          >
            Profile
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
