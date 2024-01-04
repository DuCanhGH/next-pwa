import {
  type Icon as TablerIcon,
  IconCheck as SuccessIcon,
  IconExclamationMark as WarningIcon,
  IconX as ErrorIcon,
} from "@tabler/icons-react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

import { clsx } from "@/utils/clsx.js";

const variants = ["error", "warning", "success", "info"] as const;

export type CalloutVariants = (typeof variants)[number];

export interface CalloutProps
  extends Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
    "ref"
  > {
  /**
   * Specify the color and icon variant for the callout. Defaults to "info".
   *
   * @defaultValue `"info"`
   */
  variant?: CalloutVariants;
}

const variantToIcon: Record<CalloutVariants, TablerIcon> = {
  error: ErrorIcon,
  warning: WarningIcon,
  success: SuccessIcon,
  info: WarningIcon,
};

/**
 * A simple Callout component.
 */
export const Callout = ({
  className,
  variant = "info",
  children,
  ...rest
}: CalloutProps) => {
  const Icon = variants.includes(variant)
    ? variantToIcon[variant]
    : WarningIcon;
  return (
    <span
      className={twMerge(
        clsx(
          "my-6 flex h-fit max-h-full w-full flex-row items-center gap-2 rounded-md px-3 py-2 text-base font-medium",
          "text-black md:text-sm dark:text-white [&>p]:!text-inherit",
          {
            "dark:bg-red-1000 bg-red-100": variant === "error",
            "bg-green-150 dark:bg-lime-1000": variant === "success",
            "bg-yellow-75 dark:bg-yellow-1000": variant === "warning",
            "bg-gray-200 dark:bg-zinc-800": variant === "info",
          }
        ),
        className
      )}
      {...rest}
    >
      <div className="h-5 w-5">
        <Icon
          width={20}
          height={20}
          className={clsx("rounded-full p-[2px] text-white dark:text-black", {
            "bg-red-650 dark:bg-red-300": variant === "error",
            "dark:bg-green-450 bg-green-700": variant === "success",
            "bg-yellow-700 dark:bg-yellow-400": variant === "warning",
            "bg-blue-550 dark:bg-blue-450": variant === "info",
          })}
          aria-hidden
        />
      </div>
      <span className="[&>*]:!m-0">{children}</span>
    </span>
  );
};
