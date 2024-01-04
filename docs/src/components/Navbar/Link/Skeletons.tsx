import type { ComponentPropsWithoutRef, ComponentPropsWithRef } from "react";
import { twMerge } from "tailwind-merge";

export interface NavLinkSkeletonsProps {
  parentProps?: ComponentPropsWithRef<"div">;
  skeletons: {
    additionalProps?: ComponentPropsWithoutRef<"div">;
    length: number;
    keyBase: string;
    label: string;
  };
}

export const NavLinkSkeletons = ({
  parentProps: { className: parentClassName, ...parentRest } = {},
  skeletons: {
    additionalProps: { className: skeletonClassName, ...skeletonProps } = {},
    keyBase: skeletonsKeyBase,
    label: skeletonsLabel,
    length: skeletonsLength = 0,
  },
}: NavLinkSkeletonsProps) => (
  <div
    className={twMerge("flex flex-row gap-[5px]", parentClassName)}
    aria-label={skeletonsLabel}
    aria-busy
    aria-live="polite"
    {...parentRest}
  >
    {Array.from({ length: skeletonsLength }, (_, idx) => (
      <div
        className={twMerge(
          "flex animate-pulse items-center rounded-md bg-gray-300 px-3 py-2 text-base font-medium md:justify-center md:text-sm dark:bg-slate-700",
          skeletonClassName
        )}
        key={`${skeletonsKeyBase}-${idx}`}
        {...skeletonProps}
      >
        <p className="invisible">Skeleton</p>
      </div>
    ))}
  </div>
);
