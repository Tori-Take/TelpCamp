const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/user');

// 登録フォームを表示するルート
router.get('/register', (req, res) => {
    res.render('users/register');
});

// ユーザー登録処理を行うルート
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        // User.registerメソッドでユーザーを登録（パスワードのハッシュ化も自動で行われる）
        const registeredUser = await User.register(user, password);
        // 登録後、自動的にログインさせる
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'TelpCampへようこそ！');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

// ログインフォームを表示するルート
router.get('/login', (req, res) => {
    res.render('users/login');
});

// ログイン処理を行うルート
// passport.authenticateミドルウェアを使って認証を行う
// 認証に失敗した場合は、フラッシュメッセージと共に/loginにリダイレクトする
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'おかえりなさい！');
    res.redirect('/campgrounds');
});

// ログアウト処理
router.get('/logout', (req, res, next) => {
    // passportが提供するlogoutメソッド
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'ログアウトしました。');
        res.redirect('/campgrounds');
    });
});

module.exports = router;
