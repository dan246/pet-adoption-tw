const variants = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/20 text-secondary-500',
  accent: 'bg-accent/20 text-amber-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-orange-100 text-orange-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-warm-beige text-text-secondary',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  )
}
