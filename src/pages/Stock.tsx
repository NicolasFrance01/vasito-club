import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { useAuth } from '../AuthContext';
import { PlusCircle, AlertTriangle, CheckCircle2, Edit, Trash2, ClipboardList, Save, History, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Stock.css';

const Stock: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState<number | string>(0);
  const [minQuantity, setMinQuantity] = useState<number | string>(1);
  const [revisionItems, setRevisionItems] = useState<any[]>([]);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSavingRevision, setIsSavingRevision] = useState(false);

  const { stock, updateStock, updateStockItem, deleteStockItem, addStockItem, isLoading, refreshStock, revisions } = useAppData();
  const { user: currentUser } = useAuth();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    updateStock(id, newQuantity);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStockItem({ name, quantity: Number(quantity), unit, minQuantity: Number(minQuantity) });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await updateStockItem({ 
      ...editingItem, 
      name, 
      unit, 
      quantity: Number(quantity), 
      minQuantity: Number(minQuantity) 
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteStock = async (id: string, itemName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${itemName}" del stock?`)) {
      await deleteStockItem(id);
    }
  };

  const openRevisionModal = () => {
    setRevisionItems(stock.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, unit: item.unit })));
    setRevisionNotes('');
    setIsRevisionModalOpen(true);
  };

  const handleRevisionChange = (id: string, value: string) => {
    setRevisionItems(prev => prev.map(item => item.id === id ? { ...item, quantity: value } : item));
  };

  const handleSaveRevision = async () => {
    setIsSavingRevision(true);
    try {
      const res = await fetch('/api/stock-revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: revisionItems.map(item => ({ id: item.id, quantity: Number(item.quantity) })),
          notes: revisionNotes,
          userId: currentUser?.id,
          username: currentUser?.username
        })
      });
      if (res.ok) {
        setIsRevisionModalOpen(false);
        if (refreshStock) refreshStock();
      }
    } catch (error) {
      console.error('Error saving revision:', error);
    } finally {
      setIsSavingRevision(false);
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setUnit(item.unit);
    setQuantity(item.quantity);
    setMinQuantity(item.minQuantity);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setUnit('kg');
    setQuantity(0);
    setMinQuantity(1);
    setEditingItem(null);
  };

  const formatValue = (val: number) => {
    return Number.isInteger(val) ? val.toString() : val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  };

  if (isLoading) return <div className="p-4">Cargando stock...</div>;

  return (
    <div className="stock-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Inventario de Insumos</h1>
          <p className="text-gray">Controla tu stock y recibe alertas cuando te falte materia prima.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(true)}>
            <History size={20} />
            Historial
          </button>
          <button className="btn btn-secondary" onClick={openRevisionModal}>
            <ClipboardList size={20} />
            Revisión
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={20} />
            Nuevo Insumo
          </button>
        </div>
      </div>

      <div className="card">
        <div className="stock-list">
          <div className="stock-header">
            <div className="col-name">Insumo</div>
            <div className="col-status">Estado</div>
            <div className="col-qty">Cantidad Disponible</div>
            <div className="col-actions">Acciones</div>
          </div>
          
          {stock.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '1rem' }}>
              <p>No tienes insumos registrados. ¡Agrega uno nuevo!</p>
            </div>
          ) : (
            stock.map(item => {
              const isLow = item.quantity <= item.minQuantity;
              return (
                <div key={item.id} className={`stock-item ${isLow ? 'low-stock' : ''}`}>
                  <div className="col-name">
                    <h4>{item.name}</h4>
                    <span className="text-sm text-gray">Mínimo: {item.minQuantity} {item.unit}</span>
                  </div>
                  <div className="col-status">
                    {isLow ? (
                      <span className="badge badge-pending"><AlertTriangle size={14} /> Stock Bajo</span>
                    ) : (
                      <span className="badge badge-ready"><CheckCircle2 size={14} /> Óptimo</span>
                    )}
                  </div>
                  <div className="col-qty">
                    <span className="qty-value">{formatValue(item.quantity)}</span> {item.unit}
                  </div>
                  <div className="col-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)} title="Editar"><Edit size={16}/></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStock(item.id, item.name)} title="Eliminar"><Trash2 size={16}/></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isRevisionModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2>Revisión General de Stock</h2>
              <button onClick={() => setIsRevisionModalOpen(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
              <p className="text-gray mb-4">Ingresa el stock real actual de todos tus insumos.</p>
              <div className="revision-grid">
                {revisionItems.map(item => (
                  <div key={item.id} className="revision-row">
                    <label>{item.name} ({item.unit})</label>
                    <input 
                      type="number" 
                      step="any"
                      className="input" 
                      value={item.quantity} 
                      onChange={e => handleRevisionChange(item.id, e.target.value)} 
                    />
                  </div>
                ))}
              </div>
              <div className="input-group mt-4">
                <label>Notas de la revisión (opcional)</label>
                <textarea 
                  className="input" 
                  value={revisionNotes} 
                  onChange={e => setRevisionNotes(e.target.value)}
                  placeholder="Ej: Ajuste mensual de inventario..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsRevisionModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveRevision} disabled={isSavingRevision}>
                <Save size={18} />
                {isSavingRevision ? 'Guardando...' : 'Guardar Revisión'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isAddModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Nuevo Tipo de Insumo</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddStock} className="modal-body">
              <div className="input-group">
                <label>Nombre del Insumo *</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Dulce de Leche" />
              </div>
              <div className="input-group">
                <label>Unidad de Medida *</label>
                <select className="input" value={unit} onChange={e => setUnit(e.target.value)} required>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="gr">Gramos (gr)</option>
                  <option value="lt">Litros (lt)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="un">Unidades (un)</option>
                  <option value="paquetes">Paquetes</option>
                </select>
              </div>
              <div className="input-group">
                <label>Stock Inicial *</label>
                <input type="number" step="any" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Alerta de Stock Mínimo *</label>
                <input type="number" step="any" min="0" className="input" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} required />
                <span className="text-sm text-gray mt-2">Te avisaremos cuando haya {minQuantity} {unit} o menos.</span>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Insumo</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {isEditModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Editar Insumo</h2>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="close-btn">×</button>
            </div>
            <form onSubmit={handleEditStock} className="modal-body">
              <div className="input-group">
                <label>Nombre del Insumo *</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Unidad de Medida *</label>
                <select className="input" value={unit} onChange={e => setUnit(e.target.value)} required>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="gr">Gramos (gr)</option>
                  <option value="lt">Litros (lt)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="un">Unidades (un)</option>
                  <option value="paquetes">Paquetes</option>
                </select>
              </div>
              <div className="input-group">
                <label>Cantidad Actual *</label>
                <input type="number" step="any" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Alerta de Stock Mínimo *</label>
                <input type="number" step="any" min="0" className="input" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} required />
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar Insumo</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {isHistoryModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <History className="text-accent" />
                <h2>Historial de Revisiones</h2>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
              {revisions.length === 0 ? (
                <p className="empty-state">No hay revisiones registradas todavía.</p>
              ) : (
                <div className="revision-history">
                  {[...revisions]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((rev: any, revIdx: number, sorted: any[]) => {
                      /* Build lookup of previous (older) revision quantities */
                      const prevRev = sorted[revIdx + 1];
                      const prevQtyMap: Record<string, number> = {};
                      if (prevRev?.details && Array.isArray(prevRev.details)) {
                        prevRev.details.forEach((d: any) => { prevQtyMap[d.id] = d.quantity; });
                      }

                      return (
                        <div key={rev.id} className="revision-history-item">
                          <div className="revision-history-header">
                            <span>{format(new Date(rev.date), "d 'de' MMMM, HH:mm'hs'", { locale: es })}</span>
                            <div className="flex items-center gap-1 text-sm text-gray">
                              <User size={14} /> {rev.username || 'Sistema'}
                            </div>
                          </div>
                          {rev.notes && <div className="revision-history-notes">{rev.notes}</div>}
                          <div className="revision-history-details">
                            {rev.details && Array.isArray(rev.details) && rev.details.map((detail: any, idx: number) => {
                              const item  = stock.find(s => s.id === detail.id);
                              const prev  = prevQtyMap[detail.id];
                              const delta = prev !== undefined ? detail.quantity - prev : null;
                              const chipMod = delta === null || delta === 0 ? '' : delta > 0 ? ' chip--up' : ' chip--down';

                              return (
                                <div key={idx} className={`revision-detail-chip${chipMod}`}>
                                  <span>{item?.name || 'Insumo'}</span>
                                  <div className="chip-value">
                                    {delta !== null && delta !== 0 && (
                                      <span className="chip-delta">
                                        {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}{item?.unit ? ` ${item.unit}` : ''}
                                      </span>
                                    )}
                                    <strong>{detail.quantity}{item?.unit ? ` ${item.unit}` : ''}</strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsHistoryModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Stock;
