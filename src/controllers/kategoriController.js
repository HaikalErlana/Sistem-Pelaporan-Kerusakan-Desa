const pool = require('../db/pool');

// GET: mengambil semua kategori
const getAllKategori = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT kategori_id, nama_kategori, deskripsi
       FROM kategori_kerusakan
       ORDER BY kategori_id ASC`
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    console.error('Gagal mengambil kategori:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// Mengambil berdasarkan ID kategori
const getKategoriById = async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return res.status(400).json({
      status: 'error',
      message: 'ID kategori tidak valid',
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM kategori_kerusakan WHERE kategori_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil kategori',
    });
  }
};

// Mengambil berdasarkan nama
const getKategoriByNama = async (req, res) => {
  const { nama } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM kategori_kerusakan
       WHERE nama_kategori ILIKE $1
       ORDER BY kategori_id`,
      [`%${nama}%`]
    );

    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mencari kategori',
    });
  }
};

// POST: menambahkan kategori
const createKategori = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;

    if (
      typeof nama_kategori !== 'string' ||
      !nama_kategori.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_kategori wajib diisi',
      });
    }

    const result = await pool.query(
      `INSERT INTO kategori_kerusakan (nama_kategori, deskripsi)
       VALUES ($1, $2)
       RETURNING kategori_id, nama_kategori, deskripsi`,
      [nama_kategori.trim(), deskripsi ?? null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Nama kategori sudah digunakan',
      });
    }

    console.error('Gagal menambahkan kategori:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};


const updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID kategori tidak valid',
      });
    }

    if (
      typeof nama_kategori !== 'string' ||
      !nama_kategori.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_kategori wajib diisi',
      });
    }

    const result = await pool.query(
      `UPDATE kategori_kerusakan
       SET nama_kategori = $1, deskripsi = $2
       WHERE kategori_id = $3
       RETURNING kategori_id, nama_kategori, deskripsi`,
      [nama_kategori.trim(), deskripsi ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Nama kategori sudah digunakan',
      });
    }

    console.error('Gagal memperbarui kategori:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

const deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID kategori tidak valid',
      });
    }

    const result = await pool.query(
      `DELETE FROM kategori_kerusakan
       WHERE kategori_id = $1
       RETURNING kategori_id, nama_kategori, deskripsi`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message: 'Kategori tidak dapat dihapus karena masih digunakan oleh laporan',
      });
    }

    console.error('Gagal menghapus kategori:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getAllKategori,
  getKategoriByNama,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};