import { createClient } from '@libsql/client';
const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
const r = await client.execute({
  sql: 'SELECT id, slug, name, images, updatedAt FROM Product WHERE id = ?',
  args: ['cmrgbrwyn000004kxe88s8uru']
});
const row = r.rows[0];
console.log('slug:', row.slug, '| updatedAt:', row.updatedAt);
console.log('images:', JSON.parse(row.images));
client.close();
