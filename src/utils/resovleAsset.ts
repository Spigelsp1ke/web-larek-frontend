import { CDN_URL } from './constants';
export const resolveAsset = (path: string) =>
  path.startsWith('http') ? path : `${CDN_URL}${path}`;