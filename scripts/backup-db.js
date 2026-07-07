// Copies the SQLite database to backups/ with a timestamped filename and
// prunes old backups beyond KEEP_COUNT. Run manually (`npm run db:backup`)
// or on a schedule (e.g. a daily cron job on the server).
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'dev.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const KEEP_COUNT = 14;

function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('Database file not found at', DB_PATH);
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destPath = path.join(BACKUP_DIR, `dev-${timestamp}.db`);
  fs.copyFileSync(DB_PATH, destPath);
  console.log('Backed up database to', destPath);

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.db'))
    .sort()
    .reverse();

  for (const old of backups.slice(KEEP_COUNT)) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
    console.log('Removed old backup', old);
  }
}

main();
