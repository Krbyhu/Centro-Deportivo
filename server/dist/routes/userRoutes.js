"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const verifyToken_1 = require("../lib/verifyToken");
const verifications_1 = require("../lib/verifications");
const router = express_1.Router();
router.route('/')
    .post(userController_1.signin);
router.route('/register')
    .post(verifications_1.checkDuplicateNameOrEmailOrRutOrPhone, userController_1.signup);
router.route('/profile')
    .get(verifyToken_1.tokenValidation, verifyToken_1.isAdmin, userController_1.profile);
exports.default = router;
// const express = require('express');
// const router = express.Router();
// const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
// const userController = require('../controllers/userController');
// router.get('/', isNotLoggedIn, userController.getLogin);
// router.post('/', isNotLoggedIn, userController.postLogin);
// router.get('/register', isNotLoggedIn, userController.getRegister);
// router.post('/register', isNotLoggedIn, userController.postRegister);
// router.get('/main', isLoggedIn, userController.main);
// router.get('/logout', isLoggedIn, userController.logout);
// module.exports = router;
