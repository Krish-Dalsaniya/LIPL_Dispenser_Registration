import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'dispenser_model_id', label: 'ID' },
  { key: 'model_name', label: 'Model Name' },
  { key: 'dispenser_type', label: 'Type' },
  { key: 'fuel_type', label: 'Fuel' },
  { key: 'is_iot_enabled', label: 'IoT', type: 'boolean' },
  { key: 'nozzle_count', label: 'Nozzles' },
  { key: 'connectivity_type', label: 'Connectivity' },
  { key: 'entry_date_time', label: 'Created', type: 'datetime' },
];

const emptyForm = { 
  model_name: '', 
  dispenser_type: '', 
  fuel_type: '',
  is_iot_enabled: false,
  nozzle_count: 1,
  connectivity_type: '',
  keyboard_format: ''
};

export default function DispenserModelsPage() {
  const { apiFetch } = useAuth();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await apiFetch('/api/dispenser-models');
      if (res.ok) setData(await res.json());
    } catch(e) { console.error(e); }
  };

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (row) => { setForm(row); setEditing(row.dispenser_model_id); setModal(true); };

  const handleDelete = async (row) => {
    if (!confirm(`Delete model "${row.model_name}"?`)) return;
    await apiFetch(`/api/dispenser-models/${row.dispenser_model_id}`, { method: 'DELETE' });
    load();
  };

  const handleSubmit = async () => {
    const url = editing ? `/api/dispenser-models/${editing}` : '/api/dispenser-models';
    await apiFetch(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setModal(false);
    load();
  };

  const onChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispenser Models</h1>
          <p className="page-subtitle">Manage dispenser model configurations</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Model</button>
      </div>

      <DataTable columns={columns} data={data} onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Model' : 'New Model'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </>}
      >
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Model Name *</label>
            <input className="form-input" value={form.model_name} onChange={e => onChange('model_name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Dispenser Type</label>
            <select className="form-select" value={form.dispenser_type} onChange={e => onChange('dispenser_type', e.target.value)}>
              <option value="">Select Type</option>
              <option value="Single Nozzle">Single Nozzle</option>
              <option value="Dual Nozzle">Dual Nozzle</option>
              <option value="Multi Nozzle">Multi Nozzle</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fuel Type</label>
            <select className="form-select" value={form.fuel_type} onChange={e => onChange('fuel_type', e.target.value)}>
              <option value="">Select Fuel</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="LPG">LPG</option>
              <option value="EV">EV Charging</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nozzle Count</label>
            <input className="form-input" type="number" min="1" value={form.nozzle_count} onChange={e => onChange('nozzle_count', parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Connectivity</label>
            <select className="form-select" value={form.connectivity_type} onChange={e => onChange('connectivity_type', e.target.value)}>
              <option value="">Select Connectivity</option>
              <option value="GSM">GSM</option>
              <option value="WiFi">WiFi</option>
              <option value="Ethernet">Ethernet</option>
              <option value="None">None</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Keyboard Format</label>
            <select className="form-select" value={form.keyboard_format} onChange={e => onChange('keyboard_format', e.target.value)}>
              <option value="">Select Format</option>
              <option value="Numeric">Numeric</option>
              <option value="Alphanumeric">Alphanumeric</option>
              <option value="Touchscreen">Touchscreen</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
            <input type="checkbox" id="is_iot" checked={form.is_iot_enabled} onChange={e => onChange('is_iot_enabled', e.target.checked)} />
            <label htmlFor="is_iot" className="form-label" style={{ marginBottom: 0 }}>IoT Enabled</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
