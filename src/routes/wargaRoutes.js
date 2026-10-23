const express = require('express');
const router = express.Router();

const {
  getAllWarga,
  getWargaById,
  createWarga,
  updateWarga,
  deleteWarga,
} = require('../controllers/wargaController');

router.get('/', getAllWarga);
router.get('/:id', getWargaById);
router.post('/', createWarga);
router.put('/:id', updateWarga);
router.delete('/:id', deleteWarga);

module.exports = router;