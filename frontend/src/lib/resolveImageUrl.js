export function resolveImageUrl(image, backendUrl = '') {
  const val = (image ?? '').toString().trim();
  if (!val) return '';
  if (/^(data:|https?:\/\/)/i.test(val)) return val;
  if (!backendUrl) return val;
  const needsSlash = !(backendUrl.endsWith('/') || val.startsWith('/'));
  return `${backendUrl}${needsSlash ? '/' : ''}${val}`;
}