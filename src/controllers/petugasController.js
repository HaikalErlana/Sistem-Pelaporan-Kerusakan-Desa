const pool = require('../db/pool');

// GET: mengambil semua data petugas
const getAllPetugas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT petugas_id, nama_lengkap, jabatan, no_telepon, email
       FROM petugas
       ORDER BY petugas_id ASC`
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    console.error('Gagal mengambil data petugas:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// GET: mengambil petugas berdasarkan ID
const getPetugasById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID petugas tidak valid',
      });
    }

    const result = await pool.query(
      `SELECT petugas_id, nama_lengkap, jabatan, no_telepon, email
       FROM petugas
       WHERE petugas_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Petugas tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal mengambil data petugas:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// POST: menambahkan petugas
const createPetugas = async (req, res) => {
  try {
    const { nama_lengkap, jabatan, no_telepon, email } = req.body;

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
      jabatan != null &&
      typeof jabatan !== 'string'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'jabatan harus berupa teks',
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

    const jabatanBersih = jabatan?.trim() || null;
    const teleponBersih = no_telepon?.trim() || null;
    const emailBersih = email?.trim() || null;

    if (
      emailBersih &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBersih)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid',
      });
    }

    const result = await pool.query(
      `INSERT INTO petugas
       (nama_lengkap, jabatan, no_telepon, email)
       VALUES ($1, $2, $3, $4)
       RETURNING petugas_id, nama_lengkap, jabatan, no_telepon, email`,
      [
        nama_lengkap.trim(),
        jabatanBersih,
        teleponBersih,
        emailBersih,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Petugas berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Email sudah digunakan petugas lain',
      });
    }

    console.error('Gagal menambahkan petugas:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// PUT: memperbarui data petugas
const updatePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, jabatan, no_telepon, email } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID petugas tidak valid',
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
      jabatan != null &&
      typeof jabatan !== 'string'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'jabatan harus berupa teks',
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

    const jabatanBersih = jabatan?.trim() || null;
    const teleponBersih = no_telepon?.trim() || null;
    const emailBersih = email?.trim() || null;

    if (
      emailBersih &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBersih)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid',
      });
    }

    const result = await pool.query(
      `UPDATE petugas
       SET nama_lengkap = $1,
           jabatan = $2,
           no_telepon = $3,
           email = $4
       WHERE petugas_id = $5
       RETURNING petugas_id, nama_lengkap, jabatan, no_telepon, email`,
      [
        nama_lengkap.trim(),
        jabatanBersih,
        teleponBersih,
        emailBersih,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Petugas tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Data petugas berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Email sudah digunakan petugas lain',
      });
    }

    console.error('Gagal memperbarui data petugas:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// DELETE: menghapus petugas
const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID petugas tidak valid',
      });
    }

    const result = await pool.query(
      `DELETE FROM petugas
       WHERE petugas_id = $1
       RETURNING petugas_id, nama_lengkap, jabatan, no_telepon, email`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Petugas tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Petugas berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message:
          'Petugas tidak dapat dihapus karena masih memiliki verifikasi atau penugasan',
      });
    }

    console.error('Gagal menghapus petugas:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getAllPetugas,
  getPetugasById,
  createPetugas,
  updatePetugas,
  deletePetugas,
};