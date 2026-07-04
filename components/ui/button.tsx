import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-700 rounded-full",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 rounded-full",
        outline:
          "border border-neutral-300 bg-transparent text-neutral-900 hover:border-neutral-900 rounded-full",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 rounded-full",
        ghost:
          "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full",
        link: "text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900",
        success:
          "bg-emerald-700 text-white hover:bg-emerald-800 rounded-full",
      },
      size: {
        default: "h-11 px-5 text-[14px]",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
