import React, { useState } from 'react';
import { useAppData } from '../AppDataContext';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import './Catalog.css';

const Catalog: React.FC = () => {
  const { catalog, addCatalogItem, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [promo, setPromo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return;
    
    await addCatalogItem({
      id: '', // Will be assigned by backend
      name,
      image: image || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=300&q=80',
      ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
      price: Number(price),
      promo: promo || undefined
    });
    
    setIsModalOpen(false);
    setName(''); setImage(''); setIngredients(''); setPrice(''); setPromo('');
  };

  if (isLoading) return <div className="p-4">Cargando catálogo...</div>;

  return (
    <div className="catalog animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Catálogo de Postres</h1>
          <p className="text-gray">Gestiona los productos que ofreces a tus clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          Nuevo Postre
        </button>
      </div>

      <div className="catalog-grid">
        {catalog.map(item => (
          <div key={item.id} className="card catalog-card">
            <div className="catalog-image" style={{ backgroundImage: `url(${item.image})` }}>
              {!item.image && <ImageIcon size={48} color="var(--text-secondary)" />}
              {item.promo && <div className="promo-badge">{item.promo}</div>}
            </div>
            <div className="catalog-info">
              <h3>{item.name}</h3>
              <p className="price">${item.price.toLocaleString()}</p>
              <p className="ingredients text-sm text-gray">
                {item.ingredients.join(', ')}
              </p>
            </div>
          </div>
        ))}
        {catalog.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>Tu catálogo está vacío. ¡Agrega tu primer postre!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Agregar Postre</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="input-group">
                <label>Nombre del Postre *</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Precio ($) *</label>
                <input type="number" className="input" value={price} onChange={e => setPrice(Number(e.target.value))} required />
              </div>
              <div className="input-group">
                <label>Ingredientes (separados por coma)</label>
                <input type="text" className="input" value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Ej: Chocolate, Crema, Oreo" />
              </div>
              <div className="input-group">
                <label>URL de Imagen</label>
                <input type="url" className="input" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="input-group">
                <label>Promoción (Opcional)</label>
                <input type="text" className="input" value={promo} onChange={e => setPromo(e.target.value)} placeholder="Ej: 2x $5000" />
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
