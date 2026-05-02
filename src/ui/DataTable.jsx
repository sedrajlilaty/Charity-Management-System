export default function DataTable({ columns = [], data = [], loading = false, emptyText = 'No data' }) {
  if (loading) {
    return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading...</div>
  }

  if (!data?.length) {
    return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>{emptyText}</div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'right', color: '#0D5247', fontWeight:'bold', fontSize: '0.90rem', padding: '15px 20px' }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'right' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
