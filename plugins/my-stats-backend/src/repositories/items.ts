export async function list(knex: any) {
  return await knex('my_stats_items').select('*');
}

export async function getById(knex: any, id: number) {
  return await knex('my_stats_items').where({ id }).first();
}

export async function create(knex: any, input: { name: string; value: number; description?: string | null }) {
  await knex('my_stats_items').insert({ name: input.name, value: input.value, description: input.description });
  return await knex('my_stats_items').orderBy('id', 'desc').first();
}

export async function update(knex: any, id: number, changes: Partial<{ name: string; value: number; description?: string | null }>) {
  const patch: any = { updated_at: knex.fn.now() };
  if (typeof changes.name === 'string') patch.name = changes.name;
  if (typeof changes.value === 'number') patch.value = changes.value;
  if (typeof changes.description === 'string' || changes.description === null) patch.description = changes.description;
  const updated = await knex('my_stats_items').where({ id }).update(patch);
  if (!updated) return undefined;
  return await knex('my_stats_items').where({ id }).first();
}

export async function deleteById(knex: any, id: number) {
  return await knex('my_stats_items').where({ id }).delete();
}

