import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAppData } from '../AppDataContext';
import type { Order, OrderItem, PaymentMethod } from '../types';
import './NewOrderModal.css';

interface Props {
  onClose: () => void;
}

const NewOrderModal: React.FC<Props> = ({ onClose }) => {
  const { catalog, addOrder } = useAppData();
  
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(1000);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  
  const [items, setItems] = useState<OrderItem[]>([{ catalogId: '', quantity: 1 }]);

  const handleAddItem = () => {
    setItems([...items, { catalogId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const catItem = catalog.find(c => c.id === item.catalogId);
      if (!catItem) return sum;
      return sum + (catItem.price * item.quantity);
    }, 0);
  };

  const total = calculateSubtotal() + (delivery ? deliveryCost : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some(i => !i.catalogId)) {
      alert('Por favor completa los campos requeridos y selecciona al menos un postre.');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      customerName,
      phone,
      address: delivery ? address : undefined,
      delivery,
      deliveryCost: delivery ? deliveryCost : 0,
      date: new Date(date).toISOString(), // ensure ISO format
      paymentMethod,
      items: items.filter(i => i.catalogId && i.quantity > 0),
      status: 'Pendiente',
      total
    };

    addOrder(newOrder);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h2>Nuevo Pedido</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3>Datos del Cliente</h3>
            <div className="form-row">
              <div className="input-group">
                <label>Nombre Completo *</label>
                <input type="text" className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Teléfono</label>
                <input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>Fecha y Hora (Argentina)</label>
                <input type="datetime-local" className="input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Método de Pago</label>
                <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Envío</h3>
            <div className="delivery-toggle">
              <label className="toggle-switch">
                <input type="checkbox" checked={delivery} onChange={e => setDelivery(e.target.checked)} />
                <span className="slider round"></span>
              </label>
              <span>Habilitar Envío</span>
            </div>

            {delivery && (
              <div className="form-row animate-fade-in" style={{ marginTop: '1rem' }}>
                <div className="input-group" style={{ flex: 2 }}>
                  <label>Dirección *</label>
                  <input type="text" className="input" value={address} onChange={e => setAddress(e.target.value)} required={delivery} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Costo Envío ($)</label>
                  <input type="number" className="input" value={deliveryCost} onChange={e => setDeliveryCost(Number(e.target.value))} />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Postres</h3>
            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="input-group" style={{ flex: 3, marginBottom: 0 }}>
                    <select className="input" value={item.catalogId} onChange={e => handleItemChange(index, 'catalogId', e.target.value)} required>
                      <option value="">Seleccionar Postre...</option>
                      {catalog.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - ${c.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <input type="number" min="1" className="input" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required />
                  </div>
                  {items.length > 1 && (
                    <button type="button" className="btn btn-danger icon-btn" onClick={() => handleRemoveItem(index)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary mt-2" onClick={handleAddItem}>
              <Plus size={18} /> Agregar Postre
            </button>
          </div>

          <div className="modal-footer">
            <div className="total-display">
              <span>Total a Pagar:</span>
              <h3>${total.toLocaleString()}</h3>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Pedido</button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NewOrderModal;
