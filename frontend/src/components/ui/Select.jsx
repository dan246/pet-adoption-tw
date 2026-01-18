import { ChevronDown } from 'lucide-react'

export default function Select({
  options,
  value,
  onChange,
  placeholder = '請選擇',
  className = '',
  icon: Icon,
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full appearance-none rounded-2xl border-2 border-warm-beige
          bg-white text-text-primary
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-all duration-200
          ${Icon ? 'pl-11 pr-10 py-3' : 'px-4 py-3 pr-10'}
          ${className}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
    </div>
  )
}
