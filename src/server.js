const kategoriRoutes = require('./routes/kategoriRoutes');
const lokasiRoutes = require('./routes/lokasiRoutes');
const wargaRoutes = require('./routes/wargaRoutes');
const petugasRoutes = require('./routes/petugasRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const verifikasiRoutes = require('./routes/verifikasiRoutes');
const penugasanRoutes = require('./routes/penugasanRoutes');
const express = require('express');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/kategori', kategoriRoutes);
app.use('/api/lokasi', lokasiRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/petugas', petugasRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/verifikasi', verifikasiRoutes);
app.use('/api/penugasan', penugasanRoutes);

// Endpoint untuk mengecek apakah API berjalan
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistem Pelaporan Kerusakan Fasilitas Umum Desa berjalan',
  });
});

// Endpoint untuk menguji koneksi database
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS waktu_server');

    res.json({
      status: 'success',
      message: 'Koneksi PostgreSQL berhasil',
      database_time: result.rows[0].waktu_server,
    });
  } catch (error) {
    console.error('Database connection error:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Koneksi database gagal',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});