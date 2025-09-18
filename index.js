// 必要なパッケージを読み込みます
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { reviewSchema, campgroundSchema } = require('./schemas.js'); // Joiスキーマを読み込み
const ExpressError = require('./utils/ExpressError'); // 作成したExpressErrorを読み込み
const wrapAsync = require('./utils/wrapAsync'); // 作成したwrapAsyncを読み込み

// 作成したモデルを読み込みます
const Campground = require('./models/campground');
const Review = require('./models/review');

// --- データベース接続 ---
// データベース接続処理を非同期関数として定義します
async function connectDB() {
  try {
    // 'telp-camp' という名前のデータベースに接続します
    // この処理は完了するまで待つ必要があるため await を使います
    await mongoose.connect('mongodb://127.0.0.1:27017/telp-camp');
    console.log("MongoDBに接続しました。");
  } catch (err) {
    // もし接続中にエラーが起きたら、内容を表示します
    console.error("MongoDB接続エラー:", err);
  }
}
// サーバー起動時にデータベース接続を実行します
connectDB();

// --- Expressの設定 ---
// ejs-mateをEJSのデフォルトエンジンとして使用する設定
app.engine('ejs', ejsMate);
// EJSをビューエンジンとして使用する設定
app.set('view engine', 'ejs');
// viewsフォルダの場所をExpressに教える設定
app.set('views', path.join(__dirname, 'views'));

// フォームから送信されたデータを解析するための設定
app.use(express.urlencoded({ extended: true }));
// method-overrideを使用するための設定
app.use(methodOverride('_method'));

// キャンプ場用のバリデーションミドルウェア
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // エラーの詳細をカンマ区切りの文字列に変換
        const msg = error.details.map(el => el.message).join(',');
        // ExpressErrorをスローし、エラーハンドラに処理を委ねる
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// レビュー用のバリデーションミドルウェア
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // エラーの詳細をカンマ区切りの文字列に変換
        const msg = error.details.map(el => el.message).join(',');
        // ExpressErrorをスローし、エラーハンドラに処理を委ねる
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// --- ルーティング ---
// トップページ('/')へのGETリクエストが来たときの処理
app.get('/', (req, res) => {
    // 'views/home.ejs' をレンダリングして表示します
    res.render('home');
});

// キャンプ場一覧(Index)ページへのGETリクエスト
app.get('/campgrounds', wrapAsync(async (req, res) => {
    // データベースから全てのキャンプ場データを取得します
    const campgrounds = await Campground.find({});
    // 取得したデータを 'campgrounds' という名前でビューに渡し、レンダリングします
    res.render('campgrounds/index', { campgrounds });
}));

// 新規登録(New)フォームページへのGETリクエスト
// 注意: このルートは '/campgrounds/:id' よりも先に定義する必要があります
app.get('/campgrounds/new', (req, res) => {
    // 'views/campgrounds/new.ejs' をレンダリングします
    res.render('campgrounds/new');
});

// 新規登録(Create)処理のPOSTリクエスト
// MongooseのバリデーションエラーなどはwrapAsyncが自動でキャッチするため、このルートハンドラ内でnextは不要です。
app.post('/campgrounds', validateCampground, wrapAsync(async (req, res) => {
    // フォームから送信されたデータ(req.body.campground)を元に新しいモデルインスタンスを作成
    const campground = new Campground(req.body.campground);
    // データベースに保存
    await campground.save();
    // 保存後、作成されたキャンプ場の詳細ページにリダイレクト
    res.redirect(`/campgrounds/${campground._id}`);
}));

// 詳細(Show)ページへのGETリクエスト
// '/campgrounds/:id' の :id は、URLの一部を変数として受け取るためのプレースホルダーです
app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        // データが見つからなかった場合、カスタムエラーをnextに渡す
        return next(new ExpressError('指定されたIDのキャンプ場は見つかりませんでした。', 404));
    }
    res.render('campgrounds/show', { campground });
}));

// 編集(Edit)フォームページへのGETリクエスト
app.get('/campgrounds/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        return next(new ExpressError('編集するキャンプ場が見つかりませんでした。', 404));
    }
    // 'views/campgrounds/edit.ejs' をレンダリングします
    res.render('campgrounds/edit', { campground });
}));

// 更新(Update)処理のPUTリクエスト
// MongooseのバリデーションエラーなどはwrapAsyncが自動でキャッチするため、このルートハンドラ内でnextは不要です。
app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    // findByIdAndUpdate(更新対象のid, 更新内容) でデータを検索して更新します
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // 更新後、詳細ページにリダイレクトします
    res.redirect(`/campgrounds/${campground._id}`);
}));

// 削除(Delete/Destroy)処理のDELETEリクエスト
app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    // findByIdAndDelete(削除対象のid) でデータを検索して削除します
    await Campground.findByIdAndDelete(id);
    // 削除後、一覧ページにリダイレクトします
    res.redirect('/campgrounds');
}));

// --- レビュー用のルーティング ---

// レビュー作成処理のPOSTリクエスト
app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    // 対象のキャンプ場を検索
    const campground = await Campground.findById(req.params.id);
    // フォームから送信されたデータで新しいレビューインスタンスを作成
    const review = new Review(req.body.review);
    // キャンプ場のreviews配列に新しいレビューを追加
    campground.reviews.push(review);
    // 両方の変更をデータベースに保存
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// どのルートにも一致しなかった場合のエラーハンドリング
app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした。', 404));
});

// 中央集権的なエラーハンドリングミドルウェア
// next(err) が呼ばれると、このミドルウェアが実行されます
app.use((err, req, res, next) => {
    // デフォルトのステータスコードとメッセージを設定
    const { statusCode = 500, message = '問題が起きました' } = err;
    res.status(statusCode).send(message);
});

// --- サーバー起動 ---
const port = 3000;
app.listen(port, () => {
  console.log(`TelpCampサーバーがポート${port}で待機中...`);
});
