export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header flex items-start justify-between">
     <div>
  <h1 className="page-title font-bold text-4xl text-[#094037] clear-text">
    {title}
  </h1>
  {subtitle && <p className="page-subtitle text-[#eab308]">{subtitle}</p>}
</div>
{children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}