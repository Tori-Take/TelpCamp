const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
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

module.exports = router;
