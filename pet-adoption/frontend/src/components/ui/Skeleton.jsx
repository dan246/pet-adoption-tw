export default function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    avatar: 'w-12 h-12 rounded-full',
    image: 'w-full h-48 rounded-2xl',
    card: 'w-full h-64 rounded-3xl',
    button: 'w-24 h-10 rounded-full',
  }

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}

export function PetCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-4 animate-pulse">
      <Skeleton variant="image" className="mb-4" />
      <Skeleton variant="title" className="w-2/3 mb-2" />
      <Skeleton variant="text" className="w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  )
}
