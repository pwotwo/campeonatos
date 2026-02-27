const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'campeonatos',
  password: 'secret123',
  database: 'campeonatos_db',
  ssl: false
})

async function main() {
  try {
    await client.connect()
    console.log('✅ Ligação bem sucedida!')
    await client.end()
  } catch (err: any) {
    console.log('❌ Erro:', err.message)
  }
}

main()