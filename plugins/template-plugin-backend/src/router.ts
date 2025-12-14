import express from 'express';
import { list, getById, create, update, deleteById } from './repositories/items';
import { parseId, parseCreate, parseUpdate } from './validation/items';

/**
 * 创建路由处理器
 * 
 * 此函数负责：
 * - 初始化数据库表（如果不存在）
 * - 注册所有 HTTP 路由
 * - 处理请求验证和错误处理
 */
export async function createRouter(options: { logger: any; database: any }) {
  const { logger, database } = options;
  const router = express.Router();
  router.use(express.json());

  // 初始化数据库表
  const knex = await database.getClient();
  const hasTable = await knex.schema.hasTable('template_items');
  if (!hasTable) {
    await knex.schema.createTable('template_items', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('type').notNullable();
      t.text('description');
      t.json('metadata'); // 用于存储额外的 JSON 数据
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    logger.info('template-plugin: created table template_items');
  }

  // 健康检查端点
  router.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'template-plugin' });
  });

  // API 端点示例
  router.get('/api', async (_req, res) => {
    try {
      logger.info('template-plugin: list items requested');
      const items = await list(knex);
      res.status(200).json({ items });
    } catch (e) {
      logger.error(`template-plugin: list items error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/api/:id', async (req, res) => {
    try {
      const parsed = parseId(req.params.id);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const item = await getById(knex, parsed.value);
      if (!item) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.status(200).json(item);
    } catch (e) {
      logger.error(`template-plugin: get item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.post('/api', async (req, res) => {
    try {
      const parsed = parseCreate(req.body);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const created = await create(knex, parsed.value);
      res.status(201).json(created);
    } catch (e) {
      logger.error(`template-plugin: create item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.put('/api/:id', async (req, res) => {
    try {
      const parsedId = parseId(req.params.id);
      if (!parsedId.ok) {
        res.status(400).json({ error: parsedId.error });
        return;
      }
      const parsedBody = parseUpdate(req.body);
      const row = await update(knex, parsedId.value, parsedBody.value);
      if (!row) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.status(200).json(row);
    } catch (e) {
      logger.error(`template-plugin: update item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.delete('/api/:id', async (req, res) => {
    try {
      const parsed = parseId(req.params.id);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const deleted = await deleteById(knex, parsed.value);
      if (!deleted) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.status(204).end();
    } catch (e) {
      logger.error(`template-plugin: delete item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  return router;
}

