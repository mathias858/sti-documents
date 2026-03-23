const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    user: 'postgres',
    password: 'root123',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'edoc'");
    if (res.rowCount === 0) {
      console.log('Creating database edoc...');
      await client.query('CREATE DATABASE edoc');
      console.log('Database edoc created!');
    } else {
      console.log('Database edoc already exists.');
    }
  } catch (err) {
    console.error('Error creating db:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDb();
