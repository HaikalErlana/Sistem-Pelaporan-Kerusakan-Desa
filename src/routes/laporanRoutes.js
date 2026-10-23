const express = require('express');
const router = express.Router();

const {
  getAllLaporan,
  getLaporanById,
  createLaporan,
  updateLaporan,
  deleteLaporan,
} = require('../controllers/laporanController');

router.get('/', getAllLaporan);
router.get('/:id', getLaporanById);
router.post('/', createLaporan);
router.put('/:id', updateLaporan);
router.delete('/:id', deleteLaporan);

module.exports = router;