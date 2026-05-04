import React, { useMemo } from 'react';
import { useAppData } from '../AppDataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#D98A4B', '#2E7D32', '#1565C0', '#d32f2f', '#795548', '#FFB300', '#8E24AA'];

const Reports: React.FC = () => {
  const { orders, catalog, isLoading } = useAppData();

  // Process data for charts
  const { salesByDessert, revenueByDessert, salesByPayment, revenueByPayment, salesByDay } = useMemo(() => {
    const sByDessert: Record<string, number> = {};
    const rByDessert: Record<string, number> = {};
    
    let cashCount = 0;
    let transferCount = 0;
    let cashRevenue = 0;
    let transferRevenue = 0;

    const sByDay: Record<string, Record<string, number>> = {
      'Domingo': {}, 'Lunes': {}, 'Martes': {}, 'Miércoles': {}, 'Jueves': {}, 'Viernes': {}, 'Sábado': {}
    };

    orders.forEach(order => {
      // Payment stats
      if (order.paymentMethod === 'Efectivo') {
        cashCount++;
        cashRevenue += order.total;
      } else {
        transferCount++;
        transferRevenue += order.total;
      }

      const orderDate = new Date(order.date);
      const dayName = orderDate.toLocaleDateString('es-AR', { weekday: 'long' });
      // Capitalize first letter
      const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

      // Dessert stats
      order.items.forEach(item => {
        const catItem = catalog.find(c => c.id === item.catalogId);
        if (catItem) {
          sByDessert[catItem.name] = (sByDessert[catItem.name] || 0) + item.quantity;
          rByDessert[catItem.name] = (rByDessert[catItem.name] || 0) + (item.quantity * catItem.price);
          
          if (sByDay[formattedDay]) {
            sByDay[formattedDay][catItem.name] = (sByDay[formattedDay][catItem.name] || 0) + item.quantity;
          }
        }
      });
    });

    return {
      salesByDessert: Object.entries(sByDessert).map(([name, count]) => ({ name, Ventas: count })).sort((a, b) => b.Ventas - a.Ventas),
      revenueByDessert: Object.entries(rByDessert).map(([name, total]) => ({ name, Ingresos: total })).sort((a, b) => b.Ingresos - a.Ingresos),
      salesByPayment: [
        { name: 'Efectivo', value: cashCount },
        { name: 'Transferencia', value: transferCount }
      ],
      revenueByPayment: [
        { name: 'Efectivo', value: cashRevenue },
        { name: 'Transferencia', value: transferRevenue }
      ],
      salesByDay: Object.entries(sByDay).map(([day, items]) => ({ day, ...items }))
    };
  }, [orders, catalog]);

  if (isLoading) return <div className="p-4">Cargando reportes...</div>;

  return (
    <div className="reports-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: 0 }}>
        <div>
          <Link to="/finances" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Volver a Finanzas
          </Link>
          <h1 className="text-2xl">Reportes Inteligentes</h1>
          <p className="text-gray">Analiza las métricas de tu negocio para tomar mejores decisiones.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Gráfico 1: Ventas por Postre */}
        <div className="card">
          <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Cantidad Vendida por Postre</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesByDessert} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Ventas" fill="var(--accent-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ingresos por Postre */}
        <div className="card">
          <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Dinero Generado por Postre ($)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={revenueByDessert} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Ingresos" fill="var(--success-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Medios de Pago (Ingresos) */}
        <div className="card">
          <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Ingresos por Método de Pago</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueByPayment} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name" label={(entry) => `${entry.name} ($${entry.value.toLocaleString()})`}>
                  {revenueByPayment.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4: Medios de Pago (Cantidad) */}
        <div className="card">
          <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Cantidad de Pedidos por Método</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={salesByPayment} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={(entry) => `${entry.name} (${entry.value})`}>
                  {salesByPayment.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Gráfico 5: Ventas por día */}
      <div className="card">
        <h2 className="text-xl" style={{ marginBottom: '1.5rem' }}>Popularidad Diaria por Postre</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={salesByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {catalog.map((c, index) => (
                <Line key={c.id} type="monotone" dataKey={c.name} stroke={COLORS[index % COLORS.length]} activeDot={{ r: 8 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Reports;
