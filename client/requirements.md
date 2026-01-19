## Packages
recharts | For dashboard analytics charts
date-fns | For date formatting
framer-motion | For smooth page transitions and animations
clsx | Utility for conditional class names (usually with tailwind-merge)
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}

Integration assumptions:
- User role is available on the user object (or we default to 'employee')
- Replit Auth is the source of truth for identity
- Object Storage is ready for receipt uploads
