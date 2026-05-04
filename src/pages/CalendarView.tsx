import React from 'react';
import { useAppData } from '../AppDataContext';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './CalendarView.css';

const CalendarView: React.FC = () => {
  const { orders, isLoading } = useAppData();

  if (isLoading) return <div className="p-4">Cargando calendario...</div>;

  // Filter out cancelled orders and sort by date ascending
  const upcomingOrders = orders
    .filter(o => o.status !== 'Cancelado' && o.status !== 'Entregado')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDayLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Hoy';
    if (isTomorrow(d)) return 'Mañana';
    return format(d, "EEEE d 'de' MMMM", { locale: es });
  };

  // Group by day
  const groupedOrders: Record<string, typeof orders> = {};
  upcomingOrders.forEach(order => {
    const label = getDayLabel(order.date);
    if (!groupedOrders[label]) groupedOrders[label] = [];
    groupedOrders[label].push(order);
  });

  return (
    <div className="calendar-view animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Calendario de Envíos y Preparaciones</h1>
          <p className="text-gray">Revisa los pedidos próximos organizados por fecha.</p>
        </div>
      </div>

      <div className="calendar-content">
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} color="var(--border-color)" />
            <p className="mt-2">No hay pedidos programados próximamente.</p>
          </div>
        ) : (
          Object.entries(groupedOrders).map(([dayLabel, dayOrders]) => (
            <div key={dayLabel} className="day-group">
              <h2 className="day-title">{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</h2>
              <div className="day-orders">
                {dayOrders.map(order => (
                  <div key={order.id} className="card order-card">
                    <div className="order-card-header">
                      <h3>{order.customerName}</h3>
                      <span className={`badge badge-${order.status === 'Pendiente' ? 'pending' : order.status === 'En Preparación' ? 'prep' : 'ready'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details text-gray text-sm">
                      <div className="detail-row">
                        <Clock size={16} />
                        <span>{format(parseISO(order.date), 'HH:mm')} hs</span>
                      </div>
                      {order.delivery && (
                        <div className="detail-row">
                          <MapPin size={16} />
                          <span>Envío a: {order.address}</span>
                        </div>
                      )}
                      {!order.delivery && (
                        <div className="detail-row">
                          <CheckCircle size={16} />
                          <span>Retira en local</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;
