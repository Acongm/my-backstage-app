export function parseId(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return { ok: false as const, error: 'invalid_id' };
  return { ok: true as const, value: id };
}

export function parseCreate(body: any) {
  const name = body?.name;
  const value = body?.value;
  const description = body?.description;
  if (typeof name !== 'string' || name.trim() === '') return { ok: false as const, error: 'invalid_body' };
  if (typeof value !== 'number') return { ok: false as const, error: 'invalid_body' };
  const input = { name, value, description: typeof description === 'string' ? description : description ?? null };
  return { ok: true as const, value: input };
}

export function parseUpdate(body: any) {
  const name = body?.name;
  const value = body?.value;
  const description = body?.description;
  const changes: any = {};
  if (typeof name === 'string') changes.name = name;
  if (typeof value === 'number') changes.value = value;
  if (typeof description === 'string' || description === null) changes.description = description;
  return { ok: true as const, value: changes };
}

