/**
 * Person Avatar Component - Shows initials with type-based styling
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, getUserInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const personAvatarVariants = cva(
  "flex items-center justify-center text-sm font-semibold",
  {
    variants: {
      type: {
        politician: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        corporate: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      },
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      type: "default",
      size: "default",
    },
  }
)

export interface PersonAvatarProps
  extends React.ComponentProps<typeof Avatar>,
    VariantProps<typeof personAvatarVariants> {
  name: string
  personType?: "POLITICIAN" | "CORPORATE_INSIDER" | string
  image?: string
}

const PersonAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  PersonAvatarProps
>(({ className, name, personType, image, type, size, ...props }, ref) => {
  // Determine avatar type based on person type
  const avatarType = type || (
    personType === "POLITICIAN" ? "politician" :
    personType === "CORPORATE_INSIDER" ? "corporate" :
    "default"
  )

  const initials = getUserInitials(name)

  return (
    <Avatar
      ref={ref}
      className={cn(personAvatarVariants({ size }), className)}
      {...props}
    >
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback 
        className={cn(personAvatarVariants({ type: avatarType, size }))}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
})
PersonAvatar.displayName = "PersonAvatar"

export { PersonAvatar, personAvatarVariants }