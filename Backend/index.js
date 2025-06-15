require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/posts', async (req, res) => {
  const { titulo, url, descripcion } = req.body;
  try {
    await pool.query(
      'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0)',
      [titulo, url, descripcion]
    );
    res.status(201).json({ message: 'Post creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/posts/like/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json({ message: 'Like agregado', post: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  console.log('Llamando a DELETE con id:', id);
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    console.log('Resultado de DELETE:', result);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json({ message: 'Post eliminado', post: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});