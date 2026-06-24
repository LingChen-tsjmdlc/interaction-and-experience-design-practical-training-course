"use client";

/**
 * Navbar 导航栏组件
 * 包含：品牌 Logo、导航链接、主题切换、移动端菜单
 */

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* 左侧区域：Logo */}
      <NavbarContent className="basis-1/3" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* 中间区域：桌面端水平导航菜单 */}
      <NavbarContent className="hidden lg:flex basis-1/3" justify="center">
        <div className="flex gap-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Button
                as={NextLink}
                href={item.href}
                size="md"
                variant="flat"
                className="data-[active=true]:text-primary data-[active=true]:font-medium"
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* 右侧区域：主题切换 */}
      <NavbarContent className="hidden sm:flex basis-1/3" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* 移动端区域（小屏显示） */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* 移动端展开的汉堡菜单 */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={index === siteConfig.navItems.length - 1 ? "primary" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
