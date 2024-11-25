"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@nextui-org/react";
import {
  FaHome,
  FaHandsHelping,
  FaMotorcycle,
  FaUserCircle,
  FaCoins,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { useCookies } from "react-cookie"; // For managing cookies (JWT token)

// Authentication logic (You need to implement these functions)
import { signIn, signOut } from "../utils/auth.js"; // You will create this auth.js file

export default function App() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState();
  const [cookies, setCookies, removeCookies] = useCookies(["authToken"]); // JWT token from cookies

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Donor", icon: <FaHandsHelping />, path: "/donor" },
    { name: "Rider", icon: <FaMotorcycle />, path: "/rider" },
    { name: "Requester", icon: <FaUserCircle />, path: "/requester" },
    { name: "Invester", icon: <FaMoneyBillTrendUp />, path: "/invester" },
    { name: "Humanity Coin", icon: <FaCoins />, path: "/humanity-coin" },
    { name: "Team Page", icon: <FaUsers />, path: "/team" },
    { name: "Contact Us", icon: <FaEnvelope />, path: "/contact_us" },
  ];

  const handleNavigation = (path, index) => {
    setActiveIndex(index); // Set the active index when a menu item is clicked
    router.push(path);
  };

  const handleSignOut = () => {
    signOut(); // Handle sign-out (clearing cookies, local storage, etc.)
    removeCookies("authToken");
    router.push("/"); // Redirect to homepage or sign-in page after logging out
  };

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <img
            src="https://utfs.io/f/6acd2fe6-ff76-4a5e-906e-1447de6db90f-2ps.png"
            alt="Logo"
            className="h-8 w-8"
          />
          <p className="font-bold text-inherit ml-1">Nourish Net</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="lg:flex">
          {cookies.authToken ? (
            // If user is authenticated, show Sign Out button
            <>
              <button onClick={handleSignOut} className="btn-sign-out">
                Sign Out
              </button>
            </>
          ) : (
            // If not authenticated, show Sign In and Sign Up buttons
            <>
              <button
                onClick={() => router.push("/signin")}
                className="btn-sign-in mr-2"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="btn-sign-up"
              >
                Sign Up
              </button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              color={activeIndex === index ? "primary" : "foreground"} // Apply primary color to the active item
              className="w-full flex items-center cursor-pointer"
              onClick={() => handleNavigation(item.path, index)}
              size="lg"
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
