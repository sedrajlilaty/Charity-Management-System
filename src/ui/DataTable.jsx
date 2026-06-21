// ui/DataTable.jsx
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  EmptyComponent,
  loadingComponent,
}) {
  if (isLoading) {
    return loadingComponent || (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        جاري التحميل...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return EmptyComponent || (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        لا توجد بيانات لعرضها
      </div>
    )
  }

  return (
    <div style={{
      overflowX: 'auto',
      width: '100%',
      background: 'var(--bg-surface)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.85rem',
      }}>
        {/* HEADER */}
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align || 'center',
                  color: 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '13px 16px',
                  background: 'var(--bg-muted)',
                  borderBottom: '1px solid var(--border-default)',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              style={{ transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  style={{
                    textAlign: col.align || 'center',
                    padding: '13px 16px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}