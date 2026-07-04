import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95",
        destructive:
          "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20 active:scale-95",
        outline:
          "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-indigo-300",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: "text-indigo-600 underline-offset-4 hover:underline",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95",
      },
      size: {
        default: "h-11 px-4 py-2 text-[14px]",
        sm: "h-9 rounded-md px-3 text-[13px]",
        lg: "h-12 rounded-xl px-6 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
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
