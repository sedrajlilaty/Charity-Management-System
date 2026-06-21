export default function Pagination({ page = 1, total = 0, limit = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages, start + 2)
  for (let i = start; i <= end; i += 1) pages.push(i)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <PermissionButton  className="btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</PermissionButton >
        {pages.map((p) => (
          <PermissionButton 
            key={p}
            className={p === page ? 'btn-primary' : 'btn-outline'}
            style={{ minWidth: '36px', paddingInline: '10px' }}
            onClick={() => onPageChange(p)}
          >
            {p}
          </PermissionButton >
        ))}
        <PermissionButton  className="btn-outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</PermissionButton >
      </div>
    </div>
  )
}
