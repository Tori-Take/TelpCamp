const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor } = require('../middleware');
const campgroundsController = require('../controllers/campgrounds'); // 1. コントローラーを読み込む

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

router.route('/')
    .get(wrapAsync(campgroundsController.index))
    .post(isLoggedIn, validateCampground, wrapAsync(campgroundsController.createCampground));

// New
router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campgroundsController.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, wrapAsync(campgroundsController.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgroundsController.deleteCampground));

// Edit
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgroundsController.renderEditForm));

module.exports = router;
