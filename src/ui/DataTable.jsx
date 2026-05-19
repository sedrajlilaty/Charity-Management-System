export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  EmptyComponent,
  loadingComponent,
}) {
  if (isLoading) {
    return (
      loadingComponent || (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          جاري التحميل...
        </div>
      )
    );
  }

  if (!data || data.length === 0) {
    return (
      EmptyComponent || (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          لا توجد بيانات لعرضها
        </div>
      )
    );
  }

  return (
  <div
    style={{
      overflowX: 'auto',
      width: '100%',
      borderRadius: '18px',

      // 🔥 أهم تعديل: دمج الجدول مع الخلفية
      background: 'var(--bg-base)',
      border: 'none',
    }}
  >
    <table
      className="data-table"
      style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
      }}
    >
      {/* HEADER */}
      <thead>
        <tr
          style={{
            background: 'var(--border-subtle)', // 🔥 مهم
          }}
        >
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                textAlign: col.align || 'right',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '14px 16px',
                borderBottom:
                  '1px solid var(--border-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
            style={{
              borderBottom:
                '1px solid var(--border-subtle)',
              transition: '0.2s',
            }}

            // 🔥 hover خفيف جدًا مثل الصورة
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'var(--bg-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'var(--bg-base)';
            }}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                style={{
                  textAlign: col.align || 'right',
                  padding: '14px 16px',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  verticalAlign: 'middle',
                }}
              >
                {col.render
                  ? col.render(
                      row[col.key],
                      row
                    )
                  : row[col.key] || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}