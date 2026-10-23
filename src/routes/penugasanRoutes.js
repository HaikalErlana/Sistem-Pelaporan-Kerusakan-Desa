const express = require('express');
const router = express.Router();

const {
  getAllPenugasan,
  getPenugasanById,
  createPenugasan,
  updatePenugasan,
  deletePenugasan,
} = require('../controllers/penugasanController');

router.get('/', getAllPenugasan);
router.get('/:laporan_id/:petugas_id', getPenugasanById);
router.post('/', createPenugasan);
router.put('/:laporan_id/:petugas_id', updatePenugasan);
router.delete('/:laporan_id/:petugas_id', deletePenugasan);

module.exports = router;