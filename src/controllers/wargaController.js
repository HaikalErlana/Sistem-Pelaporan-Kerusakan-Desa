const pool = require('../db/pool');

// GET: mengambil semua data warga
const getAllWarga = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT warga_id, nama_lengkap, no_telepon, email, created_at
       FROM warga
       ORDER BY warga_id ASC`
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    console.error('Gagal mengambil data warga:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// GET: mengambil satu warga berdasarkan ID
const getWargaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID warga tidak valid',
      });
    }

    const result = await pool.query(
      `SELECT warga_id, nama_lengkap, no_telepon, email, created_at
       FROM warga
       WHERE warga_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Warga tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal mengambil data warga:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// POST: menambahkan warga baru
const createWarga = async (req, res) => {
  try {
    const { nama_lengkap, no_telepon, email } = req.body;

    if (
      typeof nama_lengkap !== 'string' ||
      !nama_lengkap.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_lengkap wajib diisi',
      });
    }

    if (
      no_telepon != null &&
      typeof no_telepon !== 'string'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'no_telepon harus berupa teks',
      });
    }

    if (email != null && typeof email !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'email harus berupa teks',
      });
    }

    const nama = nama_lengkap.trim();
    const telepon = no_telepon?.trim() || null;
    const emailBersih = email?.trim() || null;

    if (emailBersih && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBersih)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid',
      });
    }

    const result = await pool.query(
      `INSERT INTO warga (nama_lengkap, no_telepon, email)
       VALUES ($1, $2, $3)
       RETURNING warga_id, nama_lengkap, no_telepon, email, created_at`,
      [nama, telepon, emailBersih]
    );

    res.status(201).json({
      status: 'success',
      message: 'Warga berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Email sudah digunakan warga lain',
      });
    }

    console.error('Gagal menambahkan warga:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// PUT: memperbarui data warga
const updateWarga = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, no_telepon, email } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID warga tidak valid',
      });
    }

    if (
      typeof nama_lengkap !== 'string' ||
      !nama_lengkap.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_lengkap wajib diisi',
      });
    }

    if (
      no_telepon != null &&
      typeof no_telepon !== 'string'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'no_telepon harus berupa teks',
      });
    }

    if (email != null && typeof email !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'email harus berupa teks',
      });
    }

    const telepon = no_telepon?.trim() || null;
    const emailBersih = email?.trim() || null;

    if (emailBersih && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBersih)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid',
      });
    }

    const result = await pool.query(
      `UPDATE warga
       SET nama_lengkap = $1,
           no_telepon = $2,
           email = $3
       WHERE warga_id = $4
       RETURNING warga_id, nama_lengkap, no_telepon, email, created_at`,
      [nama_lengkap.trim(), telepon, emailBersih, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Warga tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Data warga berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Email sudah digunakan warga lain',
      });
    }

    console.error('Gagal memperbarui data warga:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// DELETE: menghapus warga
const deleteWarga = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID warga tidak valid',
      });
    }

    const result = await pool.query(
      `DELETE FROM warga
       WHERE warga_id = $1
       RETURNING warga_id, nama_lengkap, no_telepon, email`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Warga tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Warga berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message: 'Warga tidak dapat dihapus karena sudah memiliki laporan',
      });
    }

    console.error('Gagal menghapus warga:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getAllWarga,
  getWargaById,
  createWarga,
  updateWarga,
  deleteWarga,
};