const pool = require('../db/pool');

const validId = (id) =>
  /^\d+$/.test(String(id)) && Number(id) > 0;

const getAllPenugasan = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pp.laporan_id,
        l.judul AS judul_laporan,
        pp.petugas_id,
        p.nama_lengkap AS nama_petugas,
        pp.tanggal_penugasan,
        pp.peran
      FROM penugasan_petugas pp
      JOIN laporan_kerusakan l ON l.laporan_id = pp.laporan_id
      JOIN petugas p ON p.petugas_id = pp.petugas_id
      ORDER BY pp.tanggal_penugasan DESC
    `);

    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data penugasan',
    });
  }
};

const getPenugasanById = async (req, res) => {
  const { laporan_id, petugas_id } = req.params;

  if (!validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID laporan atau petugas tidak valid',
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM penugasan_petugas
       WHERE laporan_id = $1 AND petugas_id = $2`,
      [laporan_id, petugas_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data penugasan tidak ditemukan',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data penugasan',
    });
  }
};

const createPenugasan = async (req, res) => {
  const { laporan_id, petugas_id, peran } = req.body;

  if (!validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'laporan_id dan petugas_id harus berupa ID positif',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO penugasan_petugas
        (laporan_id, petugas_id, peran)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [laporan_id, petugas_id, peran ?? null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Petugas berhasil ditugaskan',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Petugas ini sudah ditugaskan pada laporan tersebut',
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        status: 'error',
        message: 'laporan_id atau petugas_id tidak ditemukan',
      });
    }

    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat penugasan',
    });
  }
};

const updatePenugasan = async (req, res) => {
  const { laporan_id, petugas_id } = req.params;
  const { peran } = req.body;

  if (!validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID laporan atau petugas tidak valid',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE penugasan_petugas
       SET peran = $1
       WHERE laporan_id = $2 AND petugas_id = $3
       RETURNING *`,
      [peran ?? null, laporan_id, petugas_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data penugasan tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      message: 'Penugasan berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui penugasan',
    });
  }
};

const deletePenugasan = async (req, res) => {
  const { laporan_id, petugas_id } = req.params;

  if (!validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID laporan atau petugas tidak valid',
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM penugasan_petugas
       WHERE laporan_id = $1 AND petugas_id = $2
       RETURNING laporan_id`,
      [laporan_id, petugas_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data penugasan tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      message: 'Penugasan berhasil dihapus',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus penugasan',
    });
  }
};

module.exports = {
  getAllPenugasan,
  getPenugasanById,
  createPenugasan,
  updatePenugasan,
  deletePenugasan,
};