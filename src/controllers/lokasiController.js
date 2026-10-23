const pool = require('../db/pool');

const validKoordinat = (latitude, longitude) => {
  const validLatitude =
    latitude == null ||
    (typeof latitude === 'number' &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90);

  const validLongitude =
    longitude == null ||
    (typeof longitude === 'number' &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180);

  return validLatitude && validLongitude;
};

// GET: mengambil semua lokasi
const getAllLokasi = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lokasi_id, nama_fasilitas, alamat, latitude, longitude
       FROM lokasi_fasilitas
       ORDER BY lokasi_id ASC`
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    console.error('Gagal mengambil lokasi:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// GET: mengambil satu lokasi berdasarkan ID
const getLokasiById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID lokasi tidak valid',
      });
    }

    const result = await pool.query(
      `SELECT lokasi_id, nama_fasilitas, alamat, latitude, longitude
       FROM lokasi_fasilitas
       WHERE lokasi_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Lokasi tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal mengambil lokasi:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// POST: menambahkan lokasi
const createLokasi = async (req, res) => {
  try {
    const { nama_fasilitas, alamat, latitude, longitude } = req.body;

    if (
      typeof nama_fasilitas !== 'string' ||
      !nama_fasilitas.trim() ||
      typeof alamat !== 'string' ||
      !alamat.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_fasilitas dan alamat wajib diisi',
      });
    }

    if (!validKoordinat(latitude, longitude)) {
      return res.status(400).json({
        status: 'error',
        message: 'Koordinat tidak valid',
      });
    }

    const result = await pool.query(
      `INSERT INTO lokasi_fasilitas
       (nama_fasilitas, alamat, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING lokasi_id, nama_fasilitas, alamat, latitude, longitude`,
      [
        nama_fasilitas.trim(),
        alamat.trim(),
        latitude ?? null,
        longitude ?? null,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Lokasi berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal menambahkan lokasi:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// PUT: memperbarui lokasi
const updateLokasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_fasilitas, alamat, latitude, longitude } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID lokasi tidak valid',
      });
    }

    if (
      typeof nama_fasilitas !== 'string' ||
      !nama_fasilitas.trim() ||
      typeof alamat !== 'string' ||
      !alamat.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_fasilitas dan alamat wajib diisi',
      });
    }

    if (!validKoordinat(latitude, longitude)) {
      return res.status(400).json({
        status: 'error',
        message: 'Koordinat tidak valid',
      });
    }

    const result = await pool.query(
      `UPDATE lokasi_fasilitas
       SET nama_fasilitas = $1,
           alamat = $2,
           latitude = $3,
           longitude = $4
       WHERE lokasi_id = $5
       RETURNING lokasi_id, nama_fasilitas, alamat, latitude, longitude`,
      [
        nama_fasilitas.trim(),
        alamat.trim(),
        latitude ?? null,
        longitude ?? null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Lokasi tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Lokasi berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal memperbarui lokasi:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// DELETE: menghapus lokasi
const deleteLokasi = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID lokasi tidak valid',
      });
    }

    const result = await pool.query(
      `DELETE FROM lokasi_fasilitas
       WHERE lokasi_id = $1
       RETURNING lokasi_id, nama_fasilitas, alamat, latitude, longitude`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Lokasi tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Lokasi berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message: 'Lokasi tidak dapat dihapus karena masih digunakan oleh laporan',
      });
    }

    console.error('Gagal menghapus lokasi:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi,
};