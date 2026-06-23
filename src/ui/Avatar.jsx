import { cn } from '../utlis/helper'

const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-secondary-100 text-secondary-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
]

export function Avatar({ name, initials, src, size = 'md' }) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  const sizeClass = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-base', lg: 'w-12 h-12 text-base' }[size]
  const text = initials ?? (name ? name.slice(0, 2) : '؟؟')

  // لو في صورة نعرضها
  if (src) {
    return (
      <div className={cn('rounded-full flex-shrink-0 overflow-hidden', sizeClass)}>
        <img
          src={src}
          alt={name ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // لو فشل تحميل الصورة نرجع للأحرف
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement.classList.add(...AVATAR_COLORS[idx].split(' '))
            e.currentTarget.parentElement.innerHTML = `<span>${text}</span>`
          }}
        />
      </div>
    )
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizeClass, AVATAR_COLORS[idx])}>
      {text}
    </div>
  )
}