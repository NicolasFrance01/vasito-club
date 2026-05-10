import { forwardRef } from 'react';
import type { Layer } from '../data';

interface Props {
  layer: Layer;
}

const IngredientLabel = forwardRef<HTMLDivElement, Props>(({ layer }, ref) => {
  return (
    <div
      ref={ref}
      className={`ing-label ing-label--${layer.side}`}
      style={{ top: `${layer.topPercent}%` }}
    >
      <div className="ing-dot" />
      <div className="ing-line" />
      <span className="ing-text">{layer.name}</span>
    </div>
  );
});

IngredientLabel.displayName = 'IngredientLabel';
export default IngredientLabel;
