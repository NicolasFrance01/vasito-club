import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, AlertTriangle, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import './Stock.css';

const Stock: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState<number | string>(0);
  const [minQuantity, setMinQuantity] = useState<number | string>(1);
  const { stock, updateStock, updateStockItem, deleteStockItem, addStockItem, isLoading } = useAppData();

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
        <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle size={20} />
          Nuevo Insumo
        </button>
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
    </div>
  );
};

export default Stock;
