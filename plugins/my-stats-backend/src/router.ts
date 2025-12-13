import express from 'express';
import { list, getById, create, update, deleteById } from './repositories/items';
import { parseId, parseCreate, parseUpdate } from './validation/items';

export async function createRouter(options: { logger: any; database: any }) {
  const { logger, database } = options;
  const router = express.Router();
  router.use(express.json());

  const knex = await database.getClient();
  const hasTable = await knex.schema.hasTable('my_stats_items');
  if (!hasTable) {
    await knex.schema.createTable('my_stats_items', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.integer('value').notNullable();
      t.text('description');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    logger.info('my-stats: created table my_stats_items');
  }

  router.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  router.get('/stats', (_req, res) => {
    try {
      logger.info('my-stats: stats requested');
      const payload = { services: 12, apis: 5, docs: 23 };
      res.status(200).json(payload);
    } catch (e) {
      logger.error(`my-stats: stats handler error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/items', async (_req, res) => {
    try {
      const items = await list(knex);
      res.status(200).json({ items });
    } catch (e) {
      logger.error(`my-stats: list items error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/items/:id', async (req, res) => {
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
      logger.error(`my-stats: get item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.post('/items', async (req, res) => {
    try {
      const parsed = parseCreate(req.body);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const created = await create(knex, parsed.value);
      res.status(201).json(created);
    } catch (e) {
      logger.error(`my-stats: create item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.put('/items/:id', async (req, res) => {
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
      logger.error(`my-stats: update item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.delete('/items/:id', async (req, res) => {
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
      logger.error(`my-stats: delete item error: ${String(e)}`);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  return router;
}

