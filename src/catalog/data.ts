import postFull from '../assets/postre.jpeg';
import postExploded from '../assets/postre con capas.png';

export interface Layer {
  name: string;
  topPercent: number;
  side: 'left' | 'right';
}

export interface Dessert {
  id: string;
  name: string;
  description: string;
  price: string;
  tag: string;
  layers: Layer[];
  imageFull: string;
  imageExploded: string;
}

export const desserts: Dessert[] = [
  {
    id: 'durazno-ddl',
    name: 'Durazno & Dulce de Leche',
    tag: 'Postre de temporada',
    description:
      'Una explosión de sabores que combina la suavidad del bizcochuelo casero con la intensidad del dulce de leche artesanal y la frescura del durazno de temporada. Cada capa cuenta una historia.',
    price: '$4.500',
    layers: [
      { name: 'Durazno fresco',          topPercent: 14, side: 'right' },
      { name: 'Crema chantilly',          topPercent: 29, side: 'left'  },
      { name: 'Merengue italiano',        topPercent: 45, side: 'right' },
      { name: 'Dulce de leche artesanal', topPercent: 61, side: 'left'  },
      { name: 'Bizcochuelo de vainilla',  topPercent: 76, side: 'right' },
    ],
    imageFull: postFull,
    imageExploded: postExploded,
  },
];
