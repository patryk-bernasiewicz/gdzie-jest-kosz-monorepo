import * as RadixTooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { cn } from "../utils/cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

const Tooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
}: TooltipProps) => (
  <RadixTooltip.Provider delayDuration={delayDuration}>
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          className={cn(
            "z-50 rounded bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg",
            "data-[state=delayed-open]:animate-fade-in"
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

export default Tooltip;
