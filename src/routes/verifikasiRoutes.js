const express = require('express');
const router = express.Router();

const {
  getAllVerifikasi,
  getVerifikasiById,
  createVerifikasi,
  updateVerifikasi,
  deleteVerifikasi,
} = require('../controllers/verifikasiController');

router.get('/', getAllVerifikasi);
router.get('/:id', getVerifikasiById);
router.post('/', createVerifikasi);
router.put('/:id', updateVerifikasi);
router.delete('/:id', deleteVerifikasi);

module.exports = router;