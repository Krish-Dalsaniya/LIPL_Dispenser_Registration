import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Edit, Trash2, Eye } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  pageSize = 10,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getBadgeClass = (val) => {
    if (!val) return '';
    const v = String(val).toLowerCase();
    if (v === 'active' || v === 'true' || v === 'confirmed') return 'badge badge-active';
    if (v === 'inactive' || v === 'false' || v === 'cancelled') return 'badge badge-inactive';
    if (v === 'pending') return 'badge badge-pending';
    if (v === 'planning') return 'badge badge-planning';
    if (v === 'completed') return 'badge badge-completed';
    return '';
  };

  const formatCell = (col, val) => {
    if (val === null || val === undefined) return '—';
    if (col.badge) {
      const cls = getBadgeClass(val);
      return <span className={cls || 'badge'}>{String(val)}</span>;
    }
    if (col.type === 'date') {
      try {
        return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return val;
      }
    }
    if (col.type === 'datetime') {
      try {
        return new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch {
        return val;
      }
    }
    if (col.type === 'currency') {
      return `₹${Number(val).toLocaleString('en-IN')}`;
    }
    if (col.type === 'boolean') {
      return val ? <span className="badge badge-active">Yes</span> : <span className="badge badge-inactive">No</span>;
    }
    return String(val);
  };

  return (
    <div className="table-container">
      <div className="table-toolbar">
        {searchable && (
          <div className="table-search">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {sorted.length} record{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={sortKey === col.key ? 'sorted' : ''}
                  onClick={() => handleSort(col.key)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete || onView) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  No records found
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col.key}>{formatCell(col, row[col.key])}</td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {onView && (
                          <button className="btn-icon" onClick={() => onView(row)} title="View">
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button className="btn-icon" onClick={() => onEdit(row)} title="Edit">
                            <Edit size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button className="btn-icon danger" onClick={() => onDelete(row)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="pagination-btns">
            <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  className={`pagination-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
