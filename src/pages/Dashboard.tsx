import React, { useState, useMemo } from 'react';
import { useAppData } from '../AppDataContext';
import { PlusCircle, CreditCard, Clock, AlertTriangle, Edit, Trash2, User, History, Truck, MapPin, Search, Package } from 'lucide-react';
import { startOfWeek, startOfMonth, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import NewOrderModal from '../components/NewOrderModal';
import type { Order, PaymentStatus } from '../types';
import './Dashboard.css';

type DateFilter = 'all' | 'day' | 'week' | 'month' | 'range';

const Dashboard: React.FC = () => {
  const { orders, catalog, deleteOrder, updateOrderStatus, updateOrderPaymentStatus } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'pendiente-pago' | 'pendientes-entrega' | 'entregado-sin-pago' | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  /* ── 1. Date filter ───────────────────────────────────────── */
  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    if (dateFilter === 'day')
      return orders.filter(o => new Date(o.date).toDateString() === now.toDateString());
    if (dateFilter === 'week')
      return orders.filter(o => isAfter(parseISO(o.date), startOfWeek(now, { weekStartsOn: 1 })));
    if (dateFilter === 'month')
      return orders.filter(o => isAfter(parseISO(o.date), startOfMonth(now)));
    if (dateFilter === 'range' && dateFrom && dateTo) {
      const from = startOfDay(parseISO(dateFrom));
      const to   = endOfDay(parseISO(dateTo));
      return orders.filter(o => {
        const d = parseISO(o.date);
        return !isBefore(d, from) && !isAfter(d, to);
      });
    }
    return orders;
  }, [orders, dateFilter, dateFrom, dateTo]);

  /* ── 2. Card filter counts (respect date filter) ─────────── */
  const pendientePagoOrders     = dateFilteredOrders.filter(o => (o.paymentStatus ?? 'Pendiente de pago') === 'Pendiente de pago');
  const pendientesEntregaOrders = dateFilteredOrders.filter(o => ['Pendiente', 'En Elaboración', 'En Envío'].includes(o.status));
  const entregadoSinPagoOrders  = dateFilteredOrders.filter(o => (o.paymentStatus ?? '') === 'Entregado sin Pago');

  const toggleFilter = (f: typeof activeFilter) =>
    setActiveFilter(prev => (prev === f ? null : f));

  /* ── 3. Card filter ───────────────────────────────────────── */
  const cardFilteredOrders =
    activeFilter === 'pendiente-pago'       ? pendientePagoOrders
    : activeFilter === 'pendientes-entrega' ? pendientesEntregaOrders
    : activeFilter === 'entregado-sin-pago' ? entregadoSinPagoOrders
    : dateFilteredOrders;

  /* ── 4. Search ────────────────────────────────────────────── */
  const q = search.toLowerCase().trim();
  const filteredOrders = q
    ? cardFilteredOrders.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.notes?.toLowerCase().includes(q) ||
        o.items.some(item => {
          const name = catalog.find(c => c.id === item.catalogId)?.name ?? '';
          return name.toLowerCase().includes(q);
        })
      )
    : cardFilteredOrders;

  const DATE_BTNS: { key: DateFilter; label: string }[] = [
    { key: 'all',   label: 'Siempre' },
    { key: 'day',   label: 'Hoy'     },
    { key: 'week',  label: 'Semana'  },
    { key: 'month', label: 'Mes'     },
    { key: 'range', label: 'Rango'   },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Hola, Vasito Club 👋</h1>
          <p className="text-gray">Aquí tienes un resumen de tu negocio hoy.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setOrderToEdit(undefined); setIsModalOpen(true); }}>
          <PlusCircle size={20} />
          Nuevo Pedido
        </button>
      </div>

      <div className="stats-grid">
        <button
          className={`card stat-card filter-card${activeFilter === 'pendiente-pago' ? ' filter-card--active filter-card--yellow' : ''}`}
          onClick={() => toggleFilter('pendiente-pago')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
            <CreditCard size={24} color="#92400E" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Pendiente de Pago</p>
            <h3>{pendientePagoOrders.length}</h3>
          </div>
        </button>

        <button
          className={`card stat-card filter-card${activeFilter === 'pendientes-entrega' ? ' filter-card--active filter-card--blue' : ''}`}
          onClick={() => toggleFilter('pendientes-entrega')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(21,101,192,0.15)' }}>
            <Clock size={24} color="var(--status-prep-text)" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Pedidos Pendientes</p>
            <h3>{pendientesEntregaOrders.length}</h3>
          </div>
        </button>

        <button
          className={`card stat-card filter-card${activeFilter === 'entregado-sin-pago' ? ' filter-card--active filter-card--orange' : ''}`}
          onClick={() => toggleFilter('entregado-sin-pago')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(234,88,12,0.15)' }}>
            <AlertTriangle size={24} color="#9A3412" />
          </div>
          <div className="stat-info">
            <p className="text-gray">Entregado sin Pago</p>
            <h3>{entregadoSinPagoOrders.length}</h3>
          </div>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="card recent-orders">

          {/* Header: title + search */}
          <div className="orders-list-header">
            <h2 className="text-xl">Todos los Pedidos</h2>
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Buscar por cliente, postre, dirección..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Date filter bar */}
          <div className="date-filter-bar">
            <div className="date-filter-btns">
              {DATE_BTNS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`btn btn-sm ${dateFilter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {dateFilter === 'range' && (
              <div className="date-range-inputs animate-fade-in">
                <input
                  type="date"
                  className="input input-sm"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
                <span className="text-gray">→</span>
                <input
                  type="date"
                  className="input input-sm"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            )}

            <span className="orders-count text-gray text-sm">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>{search ? 'No se encontraron pedidos con esa búsqueda.' : 'No hay pedidos para los filtros seleccionados.'}</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h4>{order.customerName}</h4>
                    <p className="text-sm text-gray">{new Date(order.date).toLocaleString('es-AR')}</p>

                    {order.items.length > 0 && (
                      <div className="order-products-row">
                        {order.items.map((item, idx) => {
                          const name = catalog.find(c => c.id === item.catalogId)?.name ?? item.catalogId;
                          return (
                            <span key={idx} className="order-product-tag">
                              {name} ×{item.quantity}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {order.notes && (
                      <p className="order-notes">📝 {order.notes}</p>
                    )}

                    <div className="order-delivery-row">
                      {order.delivery ? (
                        <>
                          <Truck size={13} />
                          <span>Con envío</span>
                          {order.address && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="maps-link"
                            >
                              <MapPin size={12} />
                              Ver en Maps
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <Package size={13} />
                          <span>Sin envío</span>
                        </>
                      )}
                    </div>

                    <div className="order-audit-info">
                      <div className="audit-item">
                        <User size={12} /> {order.createdByUsername || 'Sistema'}
                      </div>
                      {order.history && order.history.length > 1 && (
                        <div className="history-indicator" title={
                          order.history.map(h => `${new Date(h.date).toLocaleTimeString('es-AR')}: ${h.status} (${h.username || '?'})`).join('\n')
                        }>
                          <History size={12} /> {order.history.length} cambios
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-status-actions">
                    <div className="order-selects">
                      <select
                        className={`status-select status-${order.status.toLowerCase().replace(/ /g, '-')}`}
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Elaboración">En Elaboración</option>
                        <option value="En Envío">En Envío</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                      <select
                        className={`status-select payment-${order.paymentStatus?.toLowerCase().replace(/ /g, '-') ?? 'pendiente-de-pago'}`}
                        value={order.paymentStatus ?? 'Pendiente de pago'}
                        onChange={e => updateOrderPaymentStatus(order.id, e.target.value as PaymentStatus)}
                      >
                        <option value="Pendiente de pago">Pendiente de pago</option>
                        <option value="Entregado sin Pago">Entregado sin Pago</option>
                        <option value="Pagado">Pagado</option>
                      </select>
                    </div>
                    <span className="order-total">${order.total.toLocaleString()}</span>
                    <div className="item-actions">
                      <button
                        className="btn btn-secondary icon-btn"
                        title="Editar Pedido"
                        onClick={() => { setOrderToEdit(order); setIsModalOpen(true); }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-danger icon-btn"
                        title="Eliminar Pedido"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
                            deleteOrder(order.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <NewOrderModal onClose={() => setIsModalOpen(false)} orderToEdit={orderToEdit} />}
    </div>
  );
};

export default Dashboard;
