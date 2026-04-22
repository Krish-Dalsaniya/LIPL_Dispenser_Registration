import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'sales_id', label: 'Order ID' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'company_name', label: 'Company' },
  { key: 'order_date', label: 'Order Date', type: 'date' },
  { key: 'po_number', label: 'PO Number' },
  { key: 'status', label: 'Status', badge: true },
  { key: 'created_at', label: 'Created', type: 'datetime' },
];

export default function SalesPage() {
  const { apiFetch } = useAuth();
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [form, setForm] = useState({ 
    customer_id: '', order_date: '', po_number: '', remarks: '', status: 'pending', 
    total_amount: 0, tax_amount: 0, discount_amount: 0, items: [] 
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); loadCustomers(); loadProducts(); }, []);

  const load = async () => {
    try {
      const res = await apiFetch('/api/sales');
      if (res.ok) setData(await res.json());
    } catch(e) { console.error(e); }
  };

  const loadCustomers = async () => {
    try {
      const res = await apiFetch('/api/customers');
      if (res.ok) setCustomers(await res.json());
    } catch(e) { console.error(e); }
  };

  const loadProducts = async () => {
    try {
      const res = await apiFetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch(e) { console.error(e); }
  };

  const openView = async (row) => {
    try {
      const res = await apiFetch(`/api/sales/${row.sales_id}`);
      if (res.ok) { setViewData(await res.json()); setViewModal(true); }
    } catch(e) { console.error(e); }
  };

  const openCreate = () => {
    setForm({ 
      customer_id: '', order_date: '', po_number: '', remarks: '', status: 'pending', 
      total_amount: 0, tax_amount: 0, discount_amount: 0, 
      items: [{ product_id: '', quantity: 1, unit_price: '' }] 
    });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (row) => { setForm(row); setEditing(row.sales_id); setModal(true); };

  const handleDelete = async (row) => {
    if (!confirm('Delete this order?')) return;
    await apiFetch(`/api/sales/${row.sales_id}`, { method: 'DELETE' });
    load();
  };

  const handleSubmit = async () => {
    const url = editing ? `/api/sales/${editing}` : '/api/sales';
    await apiFetch(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setModal(false);
    load();
  };

  const onChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateItem = (idx, key, val) => {
    const items = [...(form.items || [])];
    items[idx] = { ...items[idx], [key]: val };
    
    // Auto-calculate total amount based on line items
    const newTotal = items.reduce((sum, item) => sum + (item.quantity * (Number(item.unit_price) || 0)), 0);
    setForm(f => ({ ...f, items, total_amount: newTotal }));
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...(f.items || []), { product_id: '', quantity: 1, unit_price: '' }] }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">Manage sales orders and line items</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Order</button>
      </div>

      <DataTable columns={columns} data={data} onView={openView} onEdit={openEdit} onDelete={handleDelete} />

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Order Details" width="640px">
        {viewData && (
          <div>
            <div className="form-grid" style={{ marginBottom: 20 }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Customer</span><br /><strong>{viewData.customer_name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PO Number</span><br /><strong>{viewData.po_number}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Order Date</span><br /><strong>{new Date(viewData.order_date).toLocaleDateString('en-IN')}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</span><br /><span className={`badge badge-${viewData.status}`}>{viewData.status}</span></div>
            </div>
            
            <div className="form-grid" style={{ marginBottom: 20, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total</span><br /><strong>₹{Number(viewData.total_amount).toLocaleString('en-IN')}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tax</span><br /><strong>₹{Number(viewData.tax_amount).toLocaleString('en-IN')}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Discount</span><br /><strong>₹{Number(viewData.discount_amount).toLocaleString('en-IN')}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Net Amount</span><br /><strong style={{ color: 'var(--accent-blue-light)' }}>₹{Number(viewData.net_amount).toLocaleString('en-IN')}</strong></div>
            </div>
            {viewData.remarks && <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.85rem' }}>Remarks: {viewData.remarks}</p>}
            {viewData.items?.length > 0 && (
              <div>
                <h4 style={{ marginBottom: 8, fontSize: '0.9rem' }}>Line Items</h4>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead><tr><th>Product</th><th>Model</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {viewData.items.map(item => (
                      <tr key={item.item_id}>
                        <td>{item.product_name}</td>
                        <td>{item.model_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                        <td>₹{(item.quantity * item.unit_price).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Order' : 'New Sales Order'} width="640px"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </>}
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-select" value={form.customer_id} onChange={e => onChange('customer_id', e.target.value)} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Order Date *</label>
            <input className="form-input" type="date" value={form.order_date} onChange={e => onChange('order_date', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">PO Number</label>
            <input className="form-input" value={form.po_number} onChange={e => onChange('po_number', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Remarks</label>
            <textarea className="form-textarea" value={form.remarks || ''} onChange={e => onChange('remarks', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Total Amount (Auto)</label>
            <input className="form-input" type="number" value={form.total_amount} readOnly style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Tax Amount</label>
            <input className="form-input" type="number" value={form.tax_amount} onChange={e => onChange('tax_amount', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Discount Amount</label>
            <input className="form-input" type="number" value={form.discount_amount} onChange={e => onChange('discount_amount', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Net Total</label>
            <input className="form-input" type="number" value={form.total_amount + (Number(form.tax_amount) || 0) - (Number(form.discount_amount) || 0)} readOnly style={{ color: 'var(--accent-blue-light)', fontWeight: 'bold' }} />
          </div>
        </div>

        {!editing && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ fontSize: '0.9rem' }}>Line Items</h4>
              <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14} /> Add Item</button>
            </div>
            {(form.items || []).map((item, idx) => (
              <div key={idx} className="form-grid" style={{ marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Assembly</label>
                  <select className="form-select" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                    <option value="">Select Assembly</option>
                    {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name} ({p.production_serial_no})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qty</label>
                  <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input className="form-input" type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
