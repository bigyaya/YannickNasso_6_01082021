const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/users');
const verifyPassword = require('../middlewares/verifPassword')

router.post('/signup', verifyPassword, userCtrl.signup);
router.post('/login', verifyPassword, userCtrl.login);


module.exports = router;
