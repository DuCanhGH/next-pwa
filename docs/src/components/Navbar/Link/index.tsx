import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

import { clsx } from "@/utils/clsx.js";

export type NavLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  isActive?: boolean;
};

export const NavLink = ({
  className,
  href,
  isActive,
  ...rest
}: NavLinkProps) => (
  <Link
    href={href}
    className={twMerge(
      clsx(
        "transition-colors_opa flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-black duration-100 md:justify-center md:text-sm dark:text-white",
        isActive
          ? "bg-gray-200 dark:bg-neutral-800"
          : "hover:bg-gray-200 dark:hover:bg-neutral-800"
      ),
      className
    )}
    aria-current={isActive}
    {...rest}
  />
);
