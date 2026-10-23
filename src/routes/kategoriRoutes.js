const express = require('express');
const router = express.Router();

const {
  getAllKategori,
  getKategoriByNama,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori
} = require('../controllers/kategoriController');

router.get('/', getAllKategori);
router.get('/nama/:nama', getKategoriByNama);
router.get('/:id', getKategoriById);
router.post('/', createKategori);
router.put('/:id', updateKategori);
router.delete('/:id', deleteKategori);

module.exports = router;