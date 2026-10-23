const pool = require('../db/pool');

const HASIL_VALID = ['valid', 'tidak_valid'];

const validId = (id) => /^\d+$/.test(String(id)) && Number(id) > 0;

const getAllVerifikasi = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.verifikasi_id,
        v.laporan_id,
        l.judul AS judul_laporan,
        v.petugas_id,
        p.nama_lengkap AS nama_petugas,
        v.hasil_verifikasi,
        v.catatan,
        v.tanggal_verifikasi
      FROM verifikasi_laporan v
      JOIN laporan_kerusakan l ON l.laporan_id = v.laporan_id
      JOIN petugas p ON p.petugas_id = v.petugas_id
      ORDER BY v.tanggal_verifikasi DESC
    `);

    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data verifikasi',
    });
  }
};

const getVerifikasiById = async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID verifikasi tidak valid',
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM verifikasi_laporan WHERE verifikasi_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data verifikasi tidak ditemukan',
      });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data verifikasi',
    });
  }
};

const createVerifikasi = async (req, res) => {
  const { laporan_id, petugas_id, hasil_verifikasi, catatan } = req.body;

  if (!validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'laporan_id dan petugas_id harus berupa ID positif',
    });
  }

  if (!HASIL_VALID.includes(hasil_verifikasi)) {
    return res.status(400).json({
      status: 'error',
      message: 'hasil_verifikasi harus valid atau tidak_valid',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO verifikasi_laporan
        (laporan_id, petugas_id, hasil_verifikasi, catatan)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [laporan_id, petugas_id, hasil_verifikasi, catatan ?? null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Verifikasi laporan berhasil dibuat',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Laporan ini sudah memiliki data verifikasi',
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
      message: 'Gagal membuat verifikasi laporan',
    });
  }
};

const updateVerifikasi = async (req, res) => {
  const { id } = req.params;
  const { laporan_id, petugas_id, hasil_verifikasi, catatan } = req.body;

  if (!validId(id) || !validId(laporan_id) || !validId(petugas_id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID verifikasi, laporan, dan petugas harus valid',
    });
  }

  if (!HASIL_VALID.includes(hasil_verifikasi)) {
    return res.status(400).json({
      status: 'error',
      message: 'hasil_verifikasi harus valid atau tidak_valid',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE verifikasi_laporan
       SET laporan_id = $1,
           petugas_id = $2,
           hasil_verifikasi = $3,
           catatan = $4
       WHERE verifikasi_id = $5
       RETURNING *`,
      [laporan_id, petugas_id, hasil_verifikasi, catatan ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data verifikasi tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      message: 'Verifikasi laporan berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'Laporan tersebut sudah memiliki data verifikasi lain',
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
      message: 'Gagal memperbarui verifikasi laporan',
    });
  }
};

const deleteVerifikasi = async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID verifikasi tidak valid',
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM verifikasi_laporan
       WHERE verifikasi_id = $1
       RETURNING verifikasi_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data verifikasi tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      message: 'Verifikasi laporan berhasil dihapus',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus verifikasi laporan',
    });
  }
};

module.exports = {
  getAllVerifikasi,
  getVerifikasiById,
  createVerifikasi,
  updateVerifikasi,
  deleteVerifikasi,
};