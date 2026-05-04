import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import './Catalog.css';

const Catalog: React.FC = () => {
  const { catalog, addCatalogItem, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [carouselFiles, setCarouselFiles] = useState<FileList | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [promo, setPromo] = useState('');
  
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

    await addCatalogItem({
      id: '', // Will be assigned by backend
      name,
      coverImage: coverBase64 || undefined,
      carouselImages: carouselBase64,
      ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
      price: Number(price),
      promo: promo || undefined
    } as any);
    
    setIsModalOpen(false);
    setName(''); setCoverImage(null); setCarouselFiles(null); setIngredients(''); setPrice(''); setPromo('');
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
                {item.promo && <div className="promo-badge">{item.promo}</div>}
                
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
              <div className="catalog-info">
                <h3>{item.name}</h3>
                <p className="price">${item.price.toLocaleString()}</p>
                <p className="ingredients text-sm text-gray">
                  {item.ingredients.join(', ')}
                </p>
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
                <label>Foto de Portada</label>
                <input type="file" className="input" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
              </div>
              <div className="input-group">
                <label>Fotos de Galería (Carrusel)</label>
                <input type="file" className="input" accept="image/*" multiple onChange={e => setCarouselFiles(e.target.files)} />
                <span className="text-sm text-gray mt-2">Puedes seleccionar múltiples archivos.</span>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default Catalog;
