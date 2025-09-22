const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const usersController = require('../controllers/users');

router.route('/register')
    .get(usersController.renderRegister)
    .post(wrapAsync(usersController.register));

router.route('/login')
    .get(usersController.renderLogin)
    // passport.authenticateミドルウェアを使って認証を行う
    // 認証に失敗した場合は、フラッシュメッセージと共に/loginにリダイレクトする
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), usersController.login);

// ログアウト処理
router.get('/logout', usersController.logout);

module.exports = router;
