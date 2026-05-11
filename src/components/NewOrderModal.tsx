import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useAppData } from '../AppDataContext';
import type { Order, OrderItem, PaymentMethod, PaymentStatus } from '../types';
import './NewOrderModal.css';

interface Props {
  onClose: () => void;
  orderToEdit?: Order;
}

const NewOrderModal: React.FC<Props> = ({ onClose, orderToEdit }) => {
  const { catalog, addOrder, updateOrder } = useAppData();

  const [customerName, setCustomerName] = useState(orderToEdit?.customerName || '');
  const [phone, setPhone] = useState(orderToEdit?.phone || '');
  const [address, setAddress] = useState(orderToEdit?.address || '');
  const [notes, setNotes] = useState(orderToEdit?.notes || '');
  const [delivery, setDelivery] = useState(orderToEdit?.delivery || false);
  const [deliveryCost, setDeliveryCost] = useState(orderToEdit?.deliveryCost || 1000);

  const initialDate = orderToEdit
    ? new Date(orderToEdit.date).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);
  const [date, setDate] = useState(initialDate);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(orderToEdit?.paymentMethod || 'Efectivo');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(orderToEdit?.paymentStatus || 'Pendiente de pago');

  const [items, setItems] = useState<OrderItem[]>(
    orderToEdit?.items.length ? orderToEdit.items : [{ catalogId: '', quantity: 1 }]
  );
  const [totalOverride, setTotalOverride] = useState<number | null>(null);

  const handleAddItem = () => setItems([...items, { catalogId: '', quantity: 1 }]);

  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  /* Promo: applies per-item threshold OR when total quantity across all items >= 3 */
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const getAppliedPromo = (catalogId: string, qty: number) => {
    const catItem = catalog.find(c => c.id === catalogId);
    if (!catItem?.promos || !Array.isArray(catItem.promos)) return null;
    return catItem.promos
      .filter((p: any) => qty >= p.quantity)
      .sort((a: any, b: any) => b.quantity - a.quantity)[0] || null;
  };

  const getEffectivePromo = (catalogId: string, itemQty: number) =>
    getAppliedPromo(catalogId, Math.max(itemQty, totalQuantity));

  const calculatedTotal = items.reduce((sum, item) => {
    const catItem = catalog.find(c => c.id === item.catalogId);
    if (!catItem) return sum;
    const promo = getEffectivePromo(item.catalogId, item.quantity);
    return sum + ((promo ? promo.promoPrice : catItem.price) * item.quantity);
  }, 0) + (delivery ? deliveryCost : 0);

  const total = totalOverride !== null ? totalOverride : calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some(i => !i.catalogId)) {
      alert('Por favor completa los campos requeridos y selecciona al menos un postre.');
      return;
    }

    const orderData: Order = {
      id: orderToEdit ? orderToEdit.id : Date.now().toString(),
      customerName,
      phone,
      address: delivery ? address : undefined,
      notes: notes || undefined,
      delivery,
      deliveryCost: delivery ? deliveryCost : 0,
      date: new Date(date).toISOString(),
      paymentMethod,
      paymentStatus,
      items: items.filter(i => i.catalogId && i.quantity > 0),
      status: orderToEdit ? orderToEdit.status : 'Pendiente',
      total,
    };

    if (orderToEdit) {
      updateOrder(orderData);
    } else {
      addOrder(orderData);
    }
    onClose();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <h2>{orderToEdit ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
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
                <label>Fecha y Hora</label>
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

            <div className="form-row">
              <div className="input-group">
                <label>Estado de Pago</label>
                <select className="input" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}>
                  <option value="Pendiente de pago">Pendiente de pago</option>
                  <option value="Entregado sin Pago">Entregado sin Pago</option>
                  <option value="Pagado">Pagado</option>
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
            {totalQuantity >= 3 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="badge badge-ready text-xs">🎉 Promo activa — pedido de {totalQuantity} unidades, precio $4.000 c/u</span>
              </div>
            )}
            <div className="items-list">
              {items.map((item, index) => {
                const promo = item.catalogId ? getEffectivePromo(item.catalogId, item.quantity) : null;
                const isTotalPromo = promo && totalQuantity >= 3 && item.quantity < 3;
                return (
                  <div key={index} className="item-row" style={{ flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: 3, minWidth: '200px', marginBottom: 0 }}>
                      <select className="input" value={item.catalogId} onChange={e => handleItemChange(index, 'catalogId', e.target.value)} required>
                        <option value="">Seleccionar Postre...</option>
                        {catalog.map(c => (
                          <option key={c.id} value={c.id}>{c.name} - ${c.price}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: '80px', marginBottom: 0 }}>
                      <input type="number" min="1" className="input" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required />
                    </div>
                    {items.length > 1 && (
                      <button type="button" className="btn btn-danger icon-btn" onClick={() => handleRemoveItem(index)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    {promo && (
                      <div style={{ width: '100%', marginTop: '0.25rem' }}>
                        <span className="badge badge-ready text-xs">
                          🎉 {isTotalPromo ? 'Promo por total del pedido' : 'Precio mayorista'} (${promo.promoPrice.toLocaleString()} c/u)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="button" className="btn btn-secondary mt-2" onClick={handleAddItem}>
              <Plus size={18} /> Agregar Postre
            </button>
          </div>

          <div className="form-section">
            <h3>Notas / Detalle</h3>
            <div className="input-group">
              <textarea
                className="input"
                rows={3}
                placeholder="Indicaciones especiales, sabores, mensaje, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <div className="total-display">
              <span>Total a Pagar:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>$</span>
                <input
                  type="number"
                  className="input"
                  style={{ width: '130px', fontSize: '1.4rem', fontWeight: 700, padding: '0.3rem 0.5rem' }}
                  value={totalOverride !== null ? totalOverride : calculatedTotal}
                  onChange={e => setTotalOverride(Number(e.target.value))}
                />
                {totalOverride !== null && (
                  <button
                    type="button"
                    className="btn btn-secondary icon-btn"
                    title="Restaurar total automático"
                    onClick={() => setTotalOverride(null)}
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
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
