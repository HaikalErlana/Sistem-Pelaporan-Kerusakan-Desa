const express = require('express');
const router = express.Router();

const {
  getAllLokasi,
  getLokasiById,
  createLokasi,
  updateLokasi,
  deleteLokasi,
} = require('../controllers/lokasiController');

router.get('/', getAllLokasi);
router.get('/:id', getLokasiById);
router.post('/', createLokasi);
router.put('/:id', updateLokasi);
router.delete('/:id', deleteLokasi);

module.exports = router;