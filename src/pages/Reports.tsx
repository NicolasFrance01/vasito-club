import React, { useMemo, useState } from 'react';
import { useAppData } from '../AppDataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Percent, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subDays, startOfWeek, startOfMonth, isAfter, parseISO, getYear, getMonth, getWeek, format, startOfDay, startOfMonth as soMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#D98A4B', '#2E7D32', '#1565C0', '#d32f2f', '#795548', '#FFB300', '#8E24AA'];
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

type TimeFilter = 'day' | 'week' | 'month' | 'all' | 'specific';

const Reports: React.FC = () => {
  const { orders, catalog, finances, isLoading } = useAppData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedYear, setSelectedYear]   = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [chartGrouping, setChartGrouping] = useState<'day' | 'week' | 'month'>('month');

  /* Years present in order data */
  const availableYears = useMemo(() => {
    const years = [...new Set(orders.map(o => getYear(parseISO(o.date))))].sort((a, b) => b - a);
    return years.length ? years : [new Date().getFullYear()];
  }, [orders]);

  const applyDateFilter = <T extends { date: string }>(list: T[]): T[] => {
    const now = new Date();
    if (timeFilter === 'day')   return list.filter(o => isAfter(parseISO(o.date), subDays(now, 1)));
    if (timeFilter === 'week')  return list.filter(o => isAfter(parseISO(o.date), startOfWeek(now, { weekStartsOn: 1 })));
    if (timeFilter === 'month') return list.filter(o => isAfter(parseISO(o.date), startOfMonth(now)));
    if (timeFilter === 'specific') {
      return list.filter(o => {
        const d = parseISO(o.date);
        return getYear(d) === selectedYear &&
               (selectedMonth === null || getMonth(d) === selectedMonth);
      });
    }
    return list;
  };

  const filteredOrders  = useMemo(() => applyDateFilter(orders),   [orders,   timeFilter, selectedYear, selectedMonth]);
  const filteredFinances = useMemo(() => applyDateFilter(finances), [finances, timeFilter, selectedYear, selectedMonth]);

  /* ── Historic sales grouped by day / week / month ── */
  const { historicSalesData, totalUnitsSold } = useMemo(() => {
    const grouped = new Map<string, { sortKey: number; total: number }>();

    filteredOrders.forEach(order => {
      const d = parseISO(order.date);
      let label: string;
      let sortKey: number;

      if (chartGrouping === 'day') {
        label   = format(d, 'dd/MM/yy');
        sortKey = startOfDay(d).getTime();
      } else if (chartGrouping === 'week') {
        const ws = startOfWeek(d, { weekStartsOn: 1 });
        label   = `S${getWeek(d, { weekStartsOn: 1 })} ${getYear(d)}`;
        sortKey = ws.getTime();
      } else {
        label   = format(d, 'MMM yy', { locale: es });
        sortKey = soMonth(d).getTime();
      }

      const qty = order.items.reduce((s, i) => s + i.quantity, 0);
      const existing = grouped.get(label);
      if (existing) existing.total += qty;
      else grouped.set(label, { sortKey, total: qty });
    });

    const sorted = [...grouped.entries()]
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .map(([label, { total }]) => ({ período: label, Postres: total }));

    const totalUnits = filteredOrders.reduce((s, o) =>
      s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

    return { historicSalesData: sorted, totalUnitsSold: totalUnits };
  }, [filteredOrders, chartGrouping]);

  // Process data for charts
  const { salesByDessert, revenueByDessert, salesByDay, profitAnalysis } = useMemo(() => {
    const sByDessert: Record<string, number> = {};
    const rByDessert: Record<string, number> = {};
    const sByDay: Record<string, Record<string, number>> = {
      'Lun': {}, 'Mar': {}, 'Mié': {}, 'Jue': {}, 'Vie': {}, 'Sáb': {}, 'Dom': {}
    };

    filteredOrders.forEach(order => {
      const orderDate = parseISO(order.date);
      const dayName = orderDate.toLocaleDateString('es-AR', { weekday: 'short' });
      const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', '');

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

    const totalRevenue = filteredOrders
      .filter(o => o.paymentStatus === 'Pagado')
      .reduce((sum, o) => sum + o.total, 0);
    const totalCost = filteredFinances.reduce((sum, f) => sum + f.totalCost, 0);

    return {
      salesByDessert: Object.entries(sByDessert).map(([name, count]) => ({ name, Ventas: count })).sort((a, b) => b.Ventas - a.Ventas),
      revenueByDessert: Object.entries(rByDessert).map(([name, total]) => ({ name, Ingresos: total })).sort((a, b) => b.Ingresos - a.Ingresos),
      salesByDay: Object.entries(sByDay).map(([day, items]) => ({ day, ...items })),
      profitAnalysis: [
        { name: 'Ingresos', value: totalRevenue, fill: 'var(--success-color)' },
        { name: 'Gastos', value: totalCost, fill: 'var(--danger-color)' }
      ]
    };
  }, [filteredOrders, filteredFinances, catalog]);

  if (isLoading) return <div className="p-4">Cargando reportes...</div>;

  return (
    <div className="reports-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <div className="dashboard-header" style={{ marginBottom: 0, alignItems: 'flex-end' }}>
        <div>
          <Link to="/finances" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Volver a Finanzas
          </Link>
          <h1 className="text-2xl">Reportes de Negocio</h1>
          <p className="text-gray">Visualiza el rendimiento y rentabilidad de Vasito Club.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {/* Quick filters */}
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            {(['day', 'week', 'month', 'all', 'specific'] as TimeFilter[]).map(f => (
              <button
                key={f}
                className={`btn btn-sm ${timeFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTimeFilter(f)}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                {f === 'day' ? 'Hoy' : f === 'week' ? 'Esta Sem.' : f === 'month' ? 'Este Mes' : f === 'all' ? 'Todo' : 'Mes/Año'}
              </button>
            ))}
          </div>

          {/* Year + month pickers — only when Mes/Año is active */}
          {timeFilter === 'specific' && (
            <div className="reports-date-picker animate-fade-in">
              {/* Year row */}
              <div className="reports-date-row">
                {availableYears.map(y => (
                  <button
                    key={y}
                    className={`btn btn-sm ${selectedYear === y ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.82rem', fontWeight: 700 }}
                    onClick={() => setSelectedYear(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {/* Month row */}
              <div className="reports-date-row">
                <button
                  className={`btn btn-sm ${selectedMonth === null ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.82rem' }}
                  onClick={() => setSelectedMonth(null)}
                >
                  Todos
                </button>
                {MONTHS.map((name, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-sm ${selectedMonth === idx ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
                    onClick={() => setSelectedMonth(selectedMonth === idx ? null : idx)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
            <TrendingUp size={24} color="var(--success-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray text-sm">Vendido ({timeFilter})</p>
            <h3>${profitAnalysis[0].value.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(123, 31, 162, 0.1)' }}>
            <Percent size={24} color="#7B1FA2" />
          </div>
          <div className="stat-info">
            <p className="text-gray text-sm">Diezmo (10%)</p>
            <h3>${(profitAnalysis[0].value * 0.1).toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
            <TrendingDown size={24} color="var(--danger-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray text-sm">Gastado en Insumos</p>
            <h3>${profitAnalysis[1].value.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(217, 138, 75, 0.1)' }}>
            <ShoppingBag size={24} color="var(--accent-color)" />
          </div>
          <div className="stat-info">
            <p className="text-gray text-sm">Postres Vendidos</p>
            <h3>{totalUnitsSold.toLocaleString()} u.</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* Comparativa Rentabilidad */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl">Ingresos vs Gastos</h2>
            <div className="badge badge-ready">Margen: ${Math.max(0, profitAnalysis[0].value - profitAnalysis[1].value).toLocaleString()}</div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={profitAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(val: any) => `$${(val || 0).toLocaleString()}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popularidad Diaria Rediseñada */}
        <div className="card">
          <h2 className="text-xl mb-6">Popularidad Semanal</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={salesByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {catalog.slice(0, 3).map((c, i) => (
                    <linearGradient key={`grad-${c.id}`} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="day" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <RechartsTooltip />
                <Legend />
                {catalog.map((c, index) => (
                  <Area 
                    key={c.id} 
                    type="monotone" 
                    dataKey={c.name} 
                    stroke={COLORS[index % COLORS.length]} 
                    fillOpacity={1} 
                    fill={`url(#color${index % 3})`} 
                    stackId="1"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Ingresos por Postre */}
        <div className="card">
          <h2 className="text-xl mb-6">Ventas por Producto ($)</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={revenueByDessert} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <RechartsTooltip formatter={(value: any) => `$${Number(value || 0).toLocaleString()}`} />
                <Bar dataKey="Ingresos" fill="var(--accent-color)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 1: Ventas por Postre */}
        <div className="card">
          <h2 className="text-xl mb-6">Cantidad Vendida</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={salesByDessert} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={80} 
                  outerRadius={120} 
                  paddingAngle={5} 
                  dataKey="Ventas" 
                  nameKey="name" 
                  label
                >
                  {salesByDessert.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ventas Históricas */}
      <div className="card">
        <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 className="text-xl">Ventas Históricas</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['day', 'week', 'month'] as const).map(g => (
              <button
                key={g}
                className={`btn btn-sm ${chartGrouping === g ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.82rem' }}
                onClick={() => setChartGrouping(g)}
              >
                {g === 'day' ? 'Días' : g === 'week' ? 'Semanas' : 'Meses'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={historicSalesData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="período" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <RechartsTooltip formatter={(val: any) => [`${val} u.`, 'Postres']} />
              <Bar dataKey="Postres" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
