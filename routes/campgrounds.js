const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

// キャンプ場用のバリデーションミドルウェア
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Index
router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// New
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// Create
router.post('/', isLoggedIn, validateCampground, wrapAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // ログインユーザーのIDをauthorとして設定
    await campground.save();
    req.flash('success', '新しいキャンプ場を作成しました。');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Show
router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    if (!campground) {
        req.flash('error', '指定されたIDのキャンプ場は見つかりませんでした。');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// Edit
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', '編集するキャンプ場が見つかりませんでした。');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// Update
router.put('/:id', isLoggedIn, validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'キャンプ場情報を更新しました。');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場情報を削除しました。');
    res.redirect('/campgrounds');
}));

module.exports = router;
