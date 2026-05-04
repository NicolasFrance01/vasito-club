import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../AppDataContext';
import { PlusCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import './Recipes.css';

const Recipes: React.FC = () => {
  const { recipes, stock, addRecipe, isLoading } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [preparation, setPreparation] = useState('');
  const [ingredients, setIngredients] = useState<{ stockItemId: string, quantity: number }[]>([]);

  const handleAddIngredient = () => {
    if (stock.length === 0) return;
    setIngredients([...ingredients, { stockItemId: stock[0].id, quantity: 1 }]);
  };

  const handleIngredientChange = (index: number, field: 'stockItemId' | 'quantity', value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !preparation || ingredients.length === 0) return;
    
    await addRecipe({
      name,
      preparation,
      ingredients: ingredients as any // Types omit ID for creation
    });
    
    setIsModalOpen(false);
    setName(''); setPreparation(''); setIngredients([]);
  };

  const toggleRecipe = (id: string) => {
    if (expandedRecipe === id) setExpandedRecipe(null);
    else setExpandedRecipe(id);
  };

  if (isLoading) return <div className="p-4">Cargando recetas...</div>;

  return (
    <div className="recipes-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Libro de Recetas</h1>
          <p className="text-gray">Tus preparaciones, paso a paso y con los insumos exactos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          Nueva Receta
        </button>
      </div>

      <div className="recipes-list">
        {recipes.length === 0 ? (
          <div className="empty-state card">
            <BookOpen size={48} color="var(--border-color)" />
            <p className="mt-2">No tienes recetas guardadas.</p>
          </div>
        ) : (
          recipes.map(recipe => (
            <div key={recipe.id} className="card recipe-card">
              <div className="recipe-header" onClick={() => toggleRecipe(recipe.id)}>
                <h3>{recipe.name}</h3>
                <button className="icon-btn">
                  {expandedRecipe === recipe.id ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
              
              {expandedRecipe === recipe.id && (
                <div className="recipe-details animate-fade-in">
                  <div className="recipe-ingredients">
                    <h4>Ingredientes Necesarios:</h4>
                    <ul>
                      {recipe.ingredients.map(ing => {
                        const sItem = stock.find(s => s.id === ing.stockItemId) || ing.stockItem;
                        return (
                          <li key={ing.id}>
                            <span className="ing-qty">{ing.quantity} {sItem?.unit}</span> de {sItem?.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="recipe-prep">
                    <h4>Preparación:</h4>
                    <p>{recipe.preparation}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Nueva Receta</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="input-group">
                <label>Nombre del Postre / Receta *</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Chocotorta Tradicional" />
              </div>
              
              <div className="form-section">
                <h3>Ingredientes (Extraídos del Stock)</h3>
                {stock.length === 0 ? (
                  <p className="text-sm text-gray">Atención: Necesitas agregar insumos en el módulo de Stock primero.</p>
                ) : (
                  <>
                    <div className="ingredients-form-list">
                      {ingredients.map((ing, index) => (
                        <div key={index} className="ingredient-row">
                          <select className="input flex-2" value={ing.stockItemId} onChange={e => handleIngredientChange(index, 'stockItemId', e.target.value)} required>
                            {stock.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                            ))}
                          </select>
                          <input type="number" step="0.01" min="0.01" className="input flex-1" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', Number(e.target.value))} required placeholder="Cant." />
                          <button type="button" className="btn btn-secondary btn-sm text-danger" onClick={() => handleRemoveIngredient(index)}>×</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn btn-secondary mt-2" onClick={handleAddIngredient} style={{ fontSize: '0.85rem' }}>
                      + Añadir Insumo
                    </button>
                  </>
                )}
              </div>

              <div className="input-group">
                <label>Paso a Paso de la Preparación *</label>
                <textarea className="input" rows={5} value={preparation} onChange={e => setPreparation(e.target.value)} required placeholder="1. Mezclar el dulce de leche con el queso crema..."></textarea>
              </div>

              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={ingredients.length === 0}>Guardar Receta</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Recipes;
