export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

export interface IOrder {
  items: string[];
  email: string;
  phone: string;
  address: string;
  payment: PaymentMethod;
  total:   number;
}


export interface IProductList {
  total: number;
  items: IProduct[];
}

export interface IOrderForm {
  email: string;
  phone: string;
}

export interface IOrderDataStep1 {
  address: string;
  paymentMethod: PaymentMethod;
}

export interface IOrderDataStep2 {
  email: string;
  phone: string;
}

export type OrderData = IOrderDataStep1 & IOrderDataStep2 & {
  items: string[];
};

export interface IOrderResponse {
  id: string;
  total: number;
}

export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  order: Partial<OrderData>;
  loading: boolean;
  error?: string;
  modal: ModalType | null;
  currentStep: CheckoutStep;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type ModalType = 'productDetails' | 'basket' | 'orderSuccess';

export type PaymentMethod = 'card' | 'cash'

export type CheckoutStep = 'step1' | 'step2';

export enum AppEvent {
  PRODUCT_SELECTED = 'PRODUCT_SELECTED',
  PRODUCT_ADDED = 'PRODUCT_ADDED',
  PRODUCT_REMOVED = 'PRODUCT_REMOVED',
  ORDER_SUBMITTED = 'ORDER_SUBMITTED',
  MODAL_OPENED = 'MODAL_OPENED',
  MODAL_CLOSED = 'MODAL_CLOSED',
}