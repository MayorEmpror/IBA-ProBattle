"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../ui/navbar-menu";

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NavbarDemo() {
  return (
    <div className="relative w-1/2 flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Discover">
          <div className="flex flex-col space-y-2 text-sm">
            <HoveredLink href="/services">Browse Services</HoveredLink>
            <HoveredLink href="/services?category=tutoring">Tutoring</HoveredLink>
            <HoveredLink href="/services?category=repairs">Repairs</HoveredLink>
            <HoveredLink href="/services?category=equipment">Equipment Rental</HoveredLink>
          </div>
        </MenuItem>
        
        <MenuItem setActive={setActive} active={active} item="Account">
          <div className="flex flex-col space-y-2 text-sm">
            <HoveredLink href="/my-services">My Services</HoveredLink>
            <HoveredLink href="/my-bookings">My Bookings</HoveredLink>
            <HoveredLink href="/messages">Messages</HoveredLink>
            <HoveredLink href="/profile">Profile</HoveredLink>
          </div>
        </MenuItem>
        
        <MenuItem setActive={setActive} active={active} item="Auth">
          <div className="flex flex-col space-y-2 text-sm">
            <HoveredLink href="/login">Login</HoveredLink>
            <HoveredLink href="/signup">Sign Up</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}