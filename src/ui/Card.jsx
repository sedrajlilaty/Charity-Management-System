import { cn } from '../utlis/helper'


export function Card({ children, className, style }) {
  return <div className={cn('card', className)} style={{
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e6f0ee',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    ...style
  }}>{children}</div>
}
 
export function CardHeader({ title, children }) {
  return (
    <div className="card-header">
      <h3 className="card-title  text-[#835500] ">{title}</h3>
      {children}
    </div>
  )
}