/**
 * 数据验证层
 * 
 * 负责验证和解析输入数据
 * 使用 Result 模式返回验证结果
 */

export function parseId(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false as const, error: 'invalid_id' };
  }
  return { ok: true as const, value: id };
}

export function parseCreate(body: any) {
  const name = body?.name;
  const type = body?.type;
  const description = body?.description;
  const metadata = body?.metadata;

  if (typeof name !== 'string' || name.trim() === '') {
    return { ok: false as const, error: 'invalid_name' };
  }
  if (typeof type !== 'string' || type.trim() === '') {
    return { ok: false as const, error: 'invalid_type' };
  }

  const input = {
    name: name.trim(),
    type: type.trim(),
    description: typeof description === 'string' ? description : description ?? null,
    metadata: metadata && typeof metadata === 'object' ? metadata : null,
  };
  return { ok: true as const, value: input };
}

export function parseUpdate(body: any) {
  const name = body?.name;
  const type = body?.type;
  const description = body?.description;
  const metadata = body?.metadata;

  const changes: any = {};
  if (typeof name === 'string' && name.trim() !== '') {
    changes.name = name.trim();
  }
  if (typeof type === 'string' && type.trim() !== '') {
    changes.type = type.trim();
  }
  if (typeof description === 'string' || description === null) {
    changes.description = description;
  }
  if (metadata !== undefined) {
    changes.metadata = metadata && typeof metadata === 'object' ? metadata : null;
  }
  return { ok: true as const, value: changes };
}

