import chajaFull     from '../assets/postre chaja.jpeg';
import chajaExp      from '../assets/postre chaja con capas.png';
import oreoFull      from '../assets/postre oreo.jpg';
import oreoExp       from '../assets/postre oreo con capas.png';
import chocoFull     from '../assets/postre chocotorta.png';
import chocoExp      from '../assets/postre chocotorta con capas.png';

export interface Layer {
  name: string;
  topPercent: number;
}

export interface Dessert {
  id: string;
  name: string;
  tag: string;
  description: string;
  price: string;
  layers: Layer[];
  imageFull: string;
  imageExploded: string;
}

export const desserts: Dessert[] = [
  {
    id: 'chaja',
    name: 'Chajá',
    tag: 'Clásico favorito',
    description:
      'El postre más querido de Vasito Club. Capas de bizcochuelo esponjoso, dulce de leche artesanal, merengue aireado y coronado con duraznos frescos. Cada capa cuenta una historia.',
    price: '$4.500',
    layers: [
      { name: 'Durazno fresco',          topPercent: 16 },
      { name: 'Crema chantilly',          topPercent: 31 },
      { name: 'Merengue italiano',        topPercent: 47 },
      { name: 'Dulce de leche artesanal', topPercent: 63 },
      { name: 'Bizcochuelo de vainilla',  topPercent: 78 },
    ],
    imageFull: chajaFull,
    imageExploded: chajaExp,
  },
  {
    id: 'oreo',
    name: 'Postre Oreo',
    tag: 'El más pedido',
    description:
      'Irresistible combinación de mousse de chocolate negro con capas de galletas Oreo y crema de queso. Intenso, cremoso y profundamente adictivo desde la primera cucharada.',
    price: '$4.800',
    layers: [
      { name: 'Oreo entera',          topPercent: 16 },
      { name: 'Crema chantilly',       topPercent: 31 },
      { name: 'Mousse de chocolate',   topPercent: 47 },
      { name: 'Crema de queso',        topPercent: 63 },
      { name: 'Oreo triturada',        topPercent: 78 },
    ],
    imageFull: oreoFull,
    imageExploded: oreoExp,
  },
  {
    id: 'chocotorta',
    name: 'Chocotorta',
    tag: 'La tentación de chocolate',
    description:
      'La reina de las tortas argentinas. Chocolinas bañadas en café con dulce de leche cremoso entre capa y capa. Puro sabor patrio en su máxima expresión.',
    price: '$4.200',
    layers: [
      { name: 'Cacao en polvo',          topPercent: 16 },
      { name: 'Chocolinas',              topPercent: 31 },
      { name: 'Crema de dulce de leche', topPercent: 47 },
      { name: 'Chocolinas con café',     topPercent: 63 },
      { name: 'Crema de dulce de leche', topPercent: 78 },
    ],
    imageFull: chocoFull,
    imageExploded: chocoExp,
  },
];
