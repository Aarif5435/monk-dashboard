

export interface Products {
  id: number;
  title: string;
  variants: Variants[];
  image: Image;
  isDiscount?: boolean;
  isVariant?: boolean;
  isProdSelected?: boolean;
}

export interface Variants {
  id: number;
  product_id: number;
  title: string;
  price: string;
  isVariantSelected?: boolean;
}

export interface Image {
  id: number;
  product_id: number;
  src: string;
}