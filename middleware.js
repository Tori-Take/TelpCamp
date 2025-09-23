const { campgroundSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    // Passportが提供するisAuthenticated()でログイン状態をチェック
    if (!req.isAuthenticated()) {
        // ログイン後にリダイレクトさせるために、元のURLをセッションに保存
        req.session.returnTo = req.originalUrl;
        // ログインしていなければ、エラーメッセージをフラッシュに保存してログインページへリダイレクト
        req.flash('error', 'この操作を行うにはログインしてください。');
        return res.redirect('/login');
    }
    // ログインしていれば、次の処理（ルートハンドラなど）へ進む
    next();
}

const Campground = require('./models/campground');

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // キャンプ場の所有者と、現在ログインしているユーザーが一致しない場合
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'その操作を行う権限がありません。');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const Review = require('./models/review');

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // レビューの所有者と、現在ログインしているユーザーが一致しない場合
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'その操作を行う権限がありません。');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
