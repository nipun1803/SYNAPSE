export function resolveImageUrl(image, backendUrl = '') {
   const val = (image ?? '').toString().trim();
   if (!val) return '';
   // already absolute URL or data URI
   if (/^(data:|https?:\/\/)/i.test(val)) return val;
   // Join relative URL with backend base
   if (!backendUrl) return val;
   const needsSlash = !(backendUrl.endsWith('/') || val.startsWith('/'));
   return `${backendUrl}${needsSlash ? '/' : ''}${val}`;
 }