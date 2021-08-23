const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauces');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');




/*  Création des différentes ROUTES de l'API en leurs précisant, dans l'ordre, leurs middlewares et controllers */

router.get('/', auth, sauceCtrl.getAllSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth,  sauceCtrl.likeSauce);

module.exports = router; 