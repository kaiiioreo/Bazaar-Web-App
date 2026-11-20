// Bordered, horizontally scrollable table with the shared header style.
//   <Table columns={['Name', 'Email', { label: 'Actions', align: 'right' }]} empty="No users." isEmpty={!rows.length}>
//     {rows.map((r) => <tr key={r.id}><Td>{r.name}</Td>…</tr>)}
//   </Table>
export default function Table({ columns, children, isEmpty = false, empty = 'Nothing here yet.' }) {
  const cols = columns.map((c) => (typeof c === 'string' ? { label: c } : c))
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-cream text-muted">
          <tr>
            {cols.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={`px-4 py-3 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {isEmpty ? (
            <tr>
              <td colSpan={cols.length} className="px-4 py-10 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '', align }) {
  return <td className={`px-4 py-3 align-middle ${align === 'right' ? 'text-right' : ''} ${className}`}>{children}</td>
}
