import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Trash2, Tag, Edit } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import type { PromoType, CatalogItem } from '../types';
import './Catalog.css';

const Catalog: React.FC = () => {
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [carouselFiles, setCarouselFiles] = useState<FileList | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [promos, setPromos] = useState<PromoType[]>([]);
  const [originalItem, setOriginalItem] = useState<CatalogItem | null>(null);
  
  // State for carousel navigation per item
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const handleNextImage = (itemId: string, max: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % max
    }));
  };

  const handlePrevImage = (itemId: string, max: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + max) % max
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') return;
    
    // Process cover image
    let coverBase64 = '';
    if (coverImage) {
      coverBase64 = await compressImage(coverImage, 600, 0.7);
    }

    // Process carousel images
    const carouselBase64: string[] = [];
    if (carouselFiles) {
      for (let i = 0; i < carouselFiles.length; i++) {
        const compressed = await compressImage(carouselFiles[i], 800, 0.7);
        carouselBase64.push(compressed);
      }
    }

    const itemData: CatalogItem = {
      id: editItemId || '', // Backend will assign a new UUID if empty string and creating
      name,
      coverImage: coverBase64 || originalItem?.coverImage || undefined,
      carouselImages: carouselBase64.length > 0 ? carouselBase64 : (originalItem?.carouselImages || []),
      ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
      price: Number(price),
      promos: promos.length > 0 ? promos : undefined
    };

    if (editItemId) {
      await updateCatalogItem(itemData);
    } else {
      await addCatalogItem(itemData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditItemId(null);
    setOriginalItem(null);
    setName(''); setCoverImage(null); setCarouselFiles(null); setIngredients(''); setPrice(''); setPromos([]);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditItemId(item.id);
    setOriginalItem(item);
    setName(item.name);
    setPrice(item.price);
    setIngredients(item.ingredients.join(', '));
    setPromos(item.promos || []);
    // Note: files cannot be prepopulated due to browser security. 
    // They will remain as they were in DB if no new files are uploaded.
    setCoverImage(null);
    setCarouselFiles(null);
    setIsModalOpen(true);
  };

  const handleAddPromo = () => {
    setPromos([...promos, { quantity: 2, promoPrice: 0 }]);
  };

  const handleUpdatePromo = (index: number, field: keyof PromoType, value: any) => {
    const newPromos = [...promos];
    newPromos[index] = { ...newPromos[index], [field]: value };
    setPromos(newPromos);
  };

  const handleRemovePromo = (index: number) => {
    setPromos(promos.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}" del catálogo? Esta acción no se puede deshacer.`)) {
      await deleteCatalogItem(id);
    }
  };

  if (isLoading) return <div className="p-4">Cargando catálogo...</div>;

  return (
    <div className="catalog animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Catálogo de Postres</h1>
          <p className="text-gray">Gestiona los productos que ofreces a tus clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <PlusCircle size={20} />
          Nuevo Postre
        </button>
      </div>

      <div className="catalog-grid">
        {catalog.map(item => {
          const allImages = [];
          if (item.coverImage) allImages.push(item.coverImage);
          if (item.carouselImages && item.carouselImages.length > 0) allImages.push(...item.carouselImages);
          
          const currentIndex = activeImageIndex[item.id] || 0;
          const currentImage = allImages[currentIndex] || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=300&q=80';

          return (
            <div key={item.id} className="card catalog-card">
              <div className="catalog-image" style={{ backgroundImage: `url(${currentImage})`, position: 'relative' }}>
                {allImages.length === 0 && <ImageIcon size={48} color="var(--text-secondary)" />}
                {item.promos && item.promos.length > 0 && (
                  <div className="promo-badge">
                    <Tag size={12} style={{ display: 'inline', marginRight: '4px' }}/>
                    {item.promos.length} Promo{item.promos.length > 1 ? 's' : ''}
                  </div>
                )}
                
                {allImages.length > 1 && (
                  <>
                    <button className="carousel-btn prev" onClick={(e) => { e.stopPropagation(); handlePrevImage(item.id, allImages.length); }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className="carousel-btn next" onClick={(e) => { e.stopPropagation(); handleNextImage(item.id, allImages.length); }}>
                      <ChevronRight size={20} />
                    </button>
                    <div className="carousel-dots">
                      {allImages.map((_, i) => (
                        <span key={i} className={`dot ${i === currentIndex ? 'active' : ''}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="catalog-info" style={{ position: 'relative' }}>
                <button 
                  className="btn icon-btn" 
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-color)' }}
                  onClick={() => openEditModal(item)}
                  title="Editar Postre"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn icon-btn btn-danger" 
                  style={{ position: 'absolute', top: '1rem', right: '3.5rem', background: 'var(--bg-color)' }}
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Eliminar Postre"
                >
                  <Trash2 size={16} />
                </button>
                <h3 style={{ paddingRight: '5.5rem' }}>{item.name}</h3>
                <p className="price">${item.price.toLocaleString()}</p>
                <p className="ingredients text-sm text-gray">
                  {item.ingredients.join(', ')}
                </p>
                {item.promos && item.promos.length > 0 && (
                  <div className="catalog-promos mt-2">
                    {item.promos.sort((a: any, b: any) => a.quantity - b.quantity).map((p: any, i: number) => (
                      <span key={i} className="text-xs badge badge-prep" style={{ display: 'inline-block', marginRight: '4px', marginBottom: '4px' }}>
                        {p.quantity}+ unid: ${p.promoPrice.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {catalog.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>Tu catálogo está vacío. ¡Agrega tu primer postre!</p>
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editItemId ? 'Editar Postre' : 'Agregar Postre'}</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="close-btn">×</button>
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
                <label>Foto de Portada</label>
                {editItemId && <span className="text-xs text-gray ml-2">(Sube una nueva para reemplazar la actual)</span>}
                <input type="file" className="input" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
              </div>
              <div className="input-group">
                <label>Fotos de Galería (Carrusel)</label>
                {editItemId && <span className="text-xs text-gray ml-2">(Sube nuevas para reemplazar el carrusel actual)</span>}
                <input type="file" className="input" accept="image/*" multiple onChange={e => setCarouselFiles(e.target.files)} />
                <span className="text-sm text-gray mt-2">Puedes seleccionar múltiples archivos.</span>
              </div>
              
              <div className="form-section mt-4">
                <h3>Promociones por Cantidad</h3>
                <p className="text-sm text-gray mb-2">Define precios especiales para compras por mayor.</p>
                {promos.map((promo, index) => (
                  <div key={index} className="promo-row-modern mb-2">
                    <div className="promo-small-inputs" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                      <div className="input-with-label">
                        <label className="text-xs text-gray">Desde (cant.)</label>
                        <input type="number" className="input" min="2" value={promo.quantity} onChange={e => handleUpdatePromo(index, 'quantity', Number(e.target.value))} required />
                      </div>
                      <div className="input-with-label">
                        <label className="text-xs text-gray">Precio c/u $</label>
                        <input type="number" className="input" min="0" value={promo.promoPrice} onChange={e => handleUpdatePromo(index, 'promoPrice', Number(e.target.value))} required />
                      </div>
                      <button type="button" className="btn btn-danger icon-btn self-end" onClick={() => handleRemovePromo(index)}><Trash2 size={16}/></button>
                    </div>
                    <p className="text-xs text-accent font-semibold mt-1">
                      A partir de {promo.quantity} unidades, cada una queda a ${promo.promoPrice.toLocaleString()}
                    </p>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary mt-2" onClick={handleAddPromo} style={{ fontSize: '0.85rem' }}>
                  + Añadir Escala de Precio
                </button>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editItemId ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Catalog;
