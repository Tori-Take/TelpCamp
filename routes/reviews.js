const express = require('express');
// mergeParams: true を設定しないと、親ルーターの :id を受け取れない
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

// レビュー用のバリデーションミドルウェア
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Create Review
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', '新しいレビューを作成しました。');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Review
router.delete('/:reviewId', isLoggedIn, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました。');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
