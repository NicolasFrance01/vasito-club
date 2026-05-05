import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  Package, 
  CreditCard 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import './CalendarView.css';

const CalendarView: React.FC = () => {
  const { orders, finances, stock, catalog, isLoading } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <div className="p-4">Cargando calendario...</div>;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleEventClick = (event: any, type: 'order' | 'finance') => {
    setSelectedEvent({ ...event, type });
    setIsModalOpen(true);
  };

  const renderEventPill = (event: any, type: 'order' | 'finance') => {
    const isOrder = type === 'order';
    const label = isOrder ? event.customerName : `Compra: ${stock.find(s => s.id === event.ingredientId)?.name || 'Insumo'}`;
    const statusClass = isOrder ? (event.status === 'Listo' ? 'ready' : 'order') : 'finance';
    
    return (
      <div 
        key={`${type}-${event.id}`} 
        className={`event-pill ${statusClass}`}
        onClick={(e) => {
          e.stopPropagation();
          handleEventClick(event, type);
        }}
      >
        {isOrder ? '🛒' : '📦'} {label}
      </div>
    );
  };

  return (
    <div className="calendar-view animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Agenda Mensual</h1>
          <p className="text-gray">Pedidos de clientes y compras de insumos programadas.</p>
        </div>
        <div className="month-nav">
          <button className="btn btn-secondary btn-sm" onClick={prevMonth}><ChevronLeft size={20}/></button>
          <h2>{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
          <button className="btn btn-secondary btn-sm" onClick={nextMonth}><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="calendar-grid-container">
        <div className="calendar-days-header">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="day-name" data-short={d[0]}>{d}<span>{d.slice(1)}</span></div>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map(day => {
            const dayOrders = orders.filter(o => isSameDay(parseISO(o.date), day) && o.status !== 'Cancelado');
            const dayFinances = finances.filter(f => isSameDay(parseISO(f.date), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()} 
                className={`calendar-day ${!isCurrentMonth ? 'not-current-month' : ''} ${isTodayDate ? 'is-today' : ''}`}
              >
                <div className="day-number">
                  {format(day, 'd')}
                  {isTodayDate && <span className="badge badge-ready" style={{ padding: '2px 6px', fontSize: '10px' }}>Hoy</span>}
                </div>
                <div className="day-events">
                  {dayOrders.map(o => renderEventPill(o, 'order'))}
                  {dayFinances.map(f => renderEventPill(f, 'finance'))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedEvent && createPortal(
        <div className="modal-overlay">
          <div className="modal-content event-detail-modal animate-fade-in">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                {selectedEvent.type === 'order' ? <CalendarIcon className="text-accent" /> : <Package className="text-danger" />}
                <h2>{selectedEvent.type === 'order' ? 'Detalle del Pedido' : 'Detalle de Compra'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {selectedEvent.type === 'order' ? (
                <>
                  <div className="detail-info-row">
                    <div className="detail-label"><User size={16}/> Cliente</div>
                    <div className="detail-value"><strong>{selectedEvent.customerName}</strong></div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><Clock size={16}/> Hora</div>
                    <div className="detail-value">{format(parseISO(selectedEvent.date), 'HH:mm')} hs</div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><MapPin size={16}/> Entrega</div>
                    <div className="detail-value">{selectedEvent.delivery ? `Envío a: ${selectedEvent.address}` : 'Retira por local'}</div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><CreditCard size={16}/> Pago</div>
                    <div className="detail-value">{selectedEvent.paymentMethod}</div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><DollarSign size={16}/> Total</div>
                    <div className="detail-value"><span className="badge badge-ready">${selectedEvent.total.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-4">
                    <strong>Postres pedidos:</strong>
                    <div className="items-list-compact">
                      {selectedEvent.items.map((item: any, idx: number) => {
                        const product = catalog.find(c => c.id === item.catalogId);
                        return (
                          <div key={idx} className="item-compact">
                            <span>{item.quantity}x {product?.name || 'Producto'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-info-row">
                    <div className="detail-label"><Package size={16}/> Insumo</div>
                    <div className="detail-value"><strong>{stock.find(s => s.id === selectedEvent.ingredientId)?.name}</strong></div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><CalendarIcon size={16}/> Fecha</div>
                    <div className="detail-value">{format(parseISO(selectedEvent.date), "d 'de' MMMM, yyyy", { locale: es })}</div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><Package size={16}/> Cantidad</div>
                    <div className="detail-value">+{selectedEvent.quantityAdded} {stock.find(s => s.id === selectedEvent.ingredientId)?.unit}</div>
                  </div>
                  <div className="detail-info-row">
                    <div className="detail-label"><DollarSign size={16}/> Costo</div>
                    <div className="detail-value"><span className="badge badge-pending">-${selectedEvent.totalCost.toLocaleString()}</span></div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CalendarView;
