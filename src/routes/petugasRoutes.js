const express = require('express');
const router = express.Router();

const {
  getAllPetugas,
  getPetugasById,
  createPetugas,
  updatePetugas,
  deletePetugas,
} = require('../controllers/petugasController');

router.get('/', getAllPetugas);
router.get('/:id', getPetugasById);
router.post('/', createPetugas);
router.put('/:id', updatePetugas);
router.delete('/:id', deletePetugas);

module.exports = router;