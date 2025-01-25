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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <HeroUINavbar
      onMenuOpenChange={setIsMenuOpen}
      className="text-white bg-[#800020]"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
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
          <Link className="text-white" href="/settings/daily-update">
            Daily Update
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
          <Link className="text-[#800020]" href="/dashboard">
            Dashboard
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="text-[#800020]" href="/settings/daily-update">
            Daily Update
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="text-[#800020]" href="/settings/connections">
            Connections
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="text-[#800020]" href="/settings/invite">
            Invite
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="text-[#800020]" href="/profile">
            Profile
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroUINavbar>
  );
}
