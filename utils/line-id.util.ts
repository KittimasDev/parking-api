// utils/line-id.util.ts
export function normalizeId(id: string) {
  return (id || '').trim();
}

export function detectIdType(id: string) {
  if (!id) return 'unknown';
  if (id.startsWith('U')) return 'user';
  if (id.startsWith('C')) return 'group';
  if (id.startsWith('R')) return 'room';
  return 'unknown';
}
