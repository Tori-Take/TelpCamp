const express = require('express');
// mergeParams: true を設定しないと、親ルーターの :id を受け取れない
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { reviewSchema } = require('../schemas.js');
const { isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewsController = require('../controllers/reviews');

// レビュー用のバリデーションミドルウェア
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        // エラーをスローする代わりに、フラッシュメッセージを設定してリダイレクトします
        req.flash('error', msg);
        return res.redirect(`/campgrounds/${req.params.id}`);
    } else {
        next();
    }
}

// Create Review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

// Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview));

module.exports = router;
