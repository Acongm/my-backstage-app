/**
 * 数据访问层 (Repository)
 * 
 * 负责与数据库的交互，提供 CRUD 操作
 * 保持业务逻辑与数据访问的分离
 */

export async function list(knex: any) {
  return await knex('template_items').select('*').orderBy('created_at', 'desc');
}

export async function getById(knex: any, id: number) {
  return await knex('template_items').where({ id }).first();
}

export async function create(
  knex: any, 
  input: { 
    name: string; 
    type: string; 
    description?: string | null;
    metadata?: Record<string, any> | null;
  }
) {
  await knex('template_items').insert({ 
    name: input.name, 
    type: input.type, 
    description: input.description,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null
  });
  return await knex('template_items').orderBy('id', 'desc').first();
}

export async function update(
  knex: any, 
  id: number, 
  changes: Partial<{ 
    name: string; 
    type: string; 
    description?: string | null;
    metadata?: Record<string, any> | null;
  }>
) {
  const patch: any = { updated_at: knex.fn.now() };
  if (typeof changes.name === 'string') patch.name = changes.name;
  if (typeof changes.type === 'string') patch.type = changes.type;
  if (typeof changes.description === 'string' || changes.description === null) {
    patch.description = changes.description;
  }
  if (changes.metadata !== undefined) {
    patch.metadata = changes.metadata ? JSON.stringify(changes.metadata) : null;
  }
  const updated = await knex('template_items').where({ id }).update(patch);
  if (!updated) return undefined;
  return await knex('template_items').where({ id }).first();
}

export async function deleteById(knex: any, id: number) {
  return await knex('template_items').where({ id }).delete();
}

