"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

/**
 * IMPORTANT:
 * - We REMOVE viewportRef from Root props entirely
 * - We attach it ONLY to Viewport
 */
type ScrollAreaProps = {
  className?: string
  children: React.ReactNode
  viewportRef?: React.Ref<HTMLDivElement>
} & Omit<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
  "ref"
>

function ScrollArea({
  className,
  children,
  viewportRef,
  ...rootProps
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...rootProps} // viewportRef can NEVER be here now
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] outline-none focus-visible:ring-[3px]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="bg-border flex-1 rounded-full" />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea }
