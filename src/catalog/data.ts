import chajaFull from '../assets/postre chaja.jpeg';
import chajaExp from '../assets/postre chaja con capas.png';
import oreoFull from '../assets/postre oreo.jpg';
import oreoExp from '../assets/postre oreo con capas.png';
import chocoFull from '../assets/postre chocotorta.png';
import chocoExp from '../assets/postre chocotorta con capas.png';

export interface Layer {
  name: string;
  /** % from top of image where label points (top layer ≈ 14, bottom ≈ 82) */
  topPercent: number;
}

export interface Dessert {
  id: string;
  name: string;
  tag: string;
  description: string;
  price: string;
  /** Layers listed bottom → top (index 0 = base) */
  layers: Layer[];
  imageFull: string;
  imageExploded: string;
}

export const desserts: Dessert[] = [
  {
    id: 'chaja',
    name: 'Club Chajá',
    tag: 'Clásico favorito',
    description:
      'El postre más querido de Vasito Club. Capas de bizcochuelo esponjoso, dulce de leche, merengue triturado y coronado con duraznos frescos.',
    price: '$4.500',
    /* Stored bottom → top (index 0 = base).
       Display reverses this so 01 = Durazno (top), 06 = Bizcochuelo (base). */
    layers: [
      { name: 'Bizcochuelo de vainilla', topPercent: 84 },
      { name: 'Dulce de leche', topPercent: 68 },
      { name: 'Merengue', topPercent: 53 },
      { name: 'Bizcochuelo de vainilla', topPercent: 38 },
      { name: 'Crema', topPercent: 23 },
      { name: 'Durazno', topPercent: 10 },
    ],
    imageFull: chajaFull,
    imageExploded: chajaExp,
  },
  {
    id: 'oreo',
    name: 'La Oreoneta',
    tag: 'El más pedido',
    description:
      'Irresistible combinación de capas de Oreo triturada, dulce de leche y crema, coronada con una galleta Oreo entera y lluvia de triturado de Oreo. Intenso, cremoso y adictivo.',
    price: '$4.500',
    /* Bottom → top: 6 layers */
    layers: [
      { name: 'Triturado galletas de Oreo', topPercent: 82 },
      { name: 'Dulce de leche', topPercent: 67 },
      { name: 'Triturado galletas de Oreo', topPercent: 53 },
      { name: 'Dulce de leche', topPercent: 39 },
      { name: 'Crema', topPercent: 25 },
      { name: 'Galleta Individual Oreo', topPercent: 12 },
    ],
    imageFull: oreoFull,
    imageExploded: oreoExp,
  },
  {
    id: 'chocotorta',
    name: 'La Clasica',
    tag: 'La tentación de chocolate',
    description:
      'La reina de las tortas argentinas. Chocolinas bañadas en café alternadas con dulce de leche y crema. Puro sabor patrio en su máxima expresión.',
    price: '$4.500',
    /* Bottom → top: 7 layers */
    layers: [
      { name: 'Triturado de chocolina', topPercent: 84 },
      { name: 'Dulce de leche - Crema', topPercent: 73 },
      { name: 'Triturado de chocolina', topPercent: 61 },
      { name: 'Dulce de leche - Crema', topPercent: 50 },
      { name: 'Triturado de chocolina', topPercent: 38 },
      { name: 'Dulce de leche - Crema', topPercent: 26 },
      { name: 'Galleta chocolina', topPercent: 14 },
    ],
    imageFull: chocoFull,
    imageExploded: chocoExp,
  },
];
