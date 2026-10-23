const pool = require('../db/pool');

const STATUS_VALID = [
  'dilaporkan',
  'diverifikasi',
  'ditangani',
  'selesai',
  'ditolak',
];

const validId = (id) => /^[1-9]\d*$/.test(String(id));

const validRelasi = (warga_id, kategori_id, lokasi_id) =>
  validId(warga_id) &&
  validId(kategori_id) &&
  validId(lokasi_id);

// GET: semua laporan beserta nama warga, kategori, dan lokasi
const getAllLaporan = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.laporan_id,
        l.warga_id,
        w.nama_lengkap AS nama_warga,
        l.kategori_id,
        k.nama_kategori,
        l.lokasi_id,
        f.nama_fasilitas,
        l.judul,
        l.deskripsi,
        l.foto_url,
        l.status,
        l.tanggal_laporan
      FROM laporan_kerusakan l
      JOIN warga w ON l.warga_id = w.warga_id
      JOIN kategori_kerusakan k ON l.kategori_id = k.kategori_id
      JOIN lokasi_fasilitas f ON l.lokasi_id = f.lokasi_id
      ORDER BY l.laporan_id ASC
    `);

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    console.error('Gagal mengambil laporan:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// GET: satu laporan berdasarkan ID
const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID laporan tidak valid',
      });
    }

    const result = await pool.query(
      `SELECT
         l.laporan_id,
         l.warga_id,
         w.nama_lengkap AS nama_warga,
         l.kategori_id,
         k.nama_kategori,
         l.lokasi_id,
         f.nama_fasilitas,
         l.judul,
         l.deskripsi,
         l.foto_url,
         l.status,
         l.tanggal_laporan
       FROM laporan_kerusakan l
       JOIN warga w ON l.warga_id = w.warga_id
       JOIN kategori_kerusakan k ON l.kategori_id = k.kategori_id
       JOIN lokasi_fasilitas f ON l.lokasi_id = f.lokasi_id
       WHERE l.laporan_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Laporan tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Gagal mengambil laporan:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// POST: membuat laporan baru
const createLaporan = async (req, res) => {
  try {
    const {
      warga_id,
      kategori_id,
      lokasi_id,
      judul,
      deskripsi,
      foto_url,
    } = req.body;

    if (!validRelasi(warga_id, kategori_id, lokasi_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'warga_id, kategori_id, dan lokasi_id harus berupa ID positif yang valid',
      });
    }

    if (
      typeof judul !== 'string' ||
      !judul.trim() ||
      typeof deskripsi !== 'string' ||
      !deskripsi.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'judul dan deskripsi wajib diisi',
      });
    }

    if (foto_url != null && typeof foto_url !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'foto_url harus berupa teks',
      });
    }

    const result = await pool.query(
      `INSERT INTO laporan_kerusakan
       (warga_id, kategori_id, lokasi_id, judul, deskripsi, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING laporan_id, warga_id, kategori_id, lokasi_id,
                 judul, deskripsi, foto_url, status, tanggal_laporan`,
      [
        warga_id,
        kategori_id,
        lokasi_id,
        judul.trim(),
        deskripsi.trim(),
        foto_url?.trim() || null,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Laporan kerusakan berhasil dibuat',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        status: 'error',
        message: 'Warga, kategori, atau lokasi yang dipilih tidak ditemukan',
      });
    }

    console.error('Gagal membuat laporan:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// PUT: memperbarui laporan
const updateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      warga_id,
      kategori_id,
      lokasi_id,
      judul,
      deskripsi,
      foto_url,
      status,
    } = req.body;

    if (!validId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID laporan tidak valid',
      });
    }

    if (!validRelasi(warga_id, kategori_id, lokasi_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'warga_id, kategori_id, dan lokasi_id harus berupa ID positif yang valid',
      });
    }

    if (
      typeof judul !== 'string' ||
      !judul.trim() ||
      typeof deskripsi !== 'string' ||
      !deskripsi.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'judul dan deskripsi wajib diisi',
      });
    }

    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Status harus salah satu dari: ${STATUS_VALID.join(', ')}`,
      });
    }

    if (foto_url != null && typeof foto_url !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'foto_url harus berupa teks',
      });
    }

    const result = await pool.query(
      `UPDATE laporan_kerusakan
       SET warga_id = $1,
           kategori_id = $2,
           lokasi_id = $3,
           judul = $4,
           deskripsi = $5,
           foto_url = $6,
           status = $7
       WHERE laporan_id = $8
       RETURNING laporan_id, warga_id, kategori_id, lokasi_id,
                 judul, deskripsi, foto_url, status, tanggal_laporan`,
      [
        warga_id,
        kategori_id,
        lokasi_id,
        judul.trim(),
        deskripsi.trim(),
        foto_url?.trim() || null,
        status,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Laporan tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Laporan berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        status: 'error',
        message: 'Warga, kategori, atau lokasi yang dipilih tidak ditemukan',
      });
    }

    console.error('Gagal memperbarui laporan:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

// DELETE: menghapus laporan
const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID laporan tidak valid',
      });
    }

    const result = await pool.query(
      `DELETE FROM laporan_kerusakan
       WHERE laporan_id = $1
       RETURNING laporan_id, judul`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Laporan tidak ditemukan',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Laporan berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        status: 'error',
        message: 'Laporan tidak dapat dihapus karena masih memiliki verifikasi atau penugasan',
      });
    }

    console.error('Gagal menghapus laporan:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
};