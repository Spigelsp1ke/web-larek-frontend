import { Api, ApiListResponse } from './base/api';
import { IProduct, IProductList, IOrder, IOrderResponse } from '../types';

export class MarketAPI extends Api {
	constructor(readonly cdn: string, baseUrl: string, opt?: RequestInit) {
		super(baseUrl, opt);
	}

	getCatalog(): Promise<IProduct[]> {
		return this.get<IProductList>('/product').then(
			(d: ApiListResponse<IProduct>) =>
				d.items.map((p) => ({
					...p,
					image: this.cdn + p.image.replace('.svg', '.png'),
				}))
		);
	}

	order(data: IOrder): Promise<IOrderResponse> {
		return this.post<IOrderResponse>('/order', data);
	}
}
