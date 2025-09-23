const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgroundsController = require('../controllers/campgrounds'); // 1. コントローラーを読み込む
const multer = require('multer');
const { storage } = require('../cloudinary'); // 作成したcloudinaryの設定を読み込み
const upload = multer({ storage }); // multerにcloudinaryのストレージを設定

router.route('/')
    .get(wrapAsync(campgroundsController.index))
    // upload.array('image') をミドルウェアとして追加
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgroundsController.createCampground));

// New
router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campgroundsController.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgroundsController.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgroundsController.deleteCampground));

// Edit
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgroundsController.renderEditForm));

module.exports = router;
