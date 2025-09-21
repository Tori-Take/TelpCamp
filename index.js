// 必要なパッケージを読み込みます
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError'); // 作成したExpressErrorを読み込み
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// ルーターを読み込みます
const campgroundRoutes = require('./routes/campgrounds');
const wrapAsync = require('./utils/wrapAsync');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

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

// publicディレクトリの静的ファイルを提供するための設定
app.use(express.static(path.join(__dirname, 'public')));

// --- セッションの設定 ---
const sessionConfig = {
    secret: 'mysecret', // セッションIDの署名に使用されるキー
    resave: false, // セッションに変更がない場合でも再保存しない
    saveUninitialized: true, // 未初期化のセッションを保存する
    cookie: {
        httpOnly: true, // JavaScriptからクッキーにアクセスできないようにする
        // secure: true, // HTTPSでのみクッキーを送信する（本番環境用）
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // クッキーの有効期限 (1週間)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// フラッシュメッセージ用のミドルウェア
app.use(flash());

// --- Passportの設定 ---
// Passportを初期化し、セッションでログイン状態を維持するためのミドルウェア
app.use(passport.initialize());
app.use(passport.session()); // session()ミドルウェアの後に記述することが重要

// Passportに、認証方法としてローカルストラテジーを使用し、その認証ロジックはUserモデルのauthenticateメソッドを使うよう指示
passport.use(new LocalStrategy(User.authenticate()));

// ユーザー情報をセッションに保存/セッションから復元するための設定
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// すべてのリクエストでフラッシュメッセージをビューで使えるようにするミドルウェア
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// --- ルーティング ---
// ルーターを使用する
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// トップページ('/')へのGETリクエストが来たときの処理
app.get('/', (req, res) => {
    // 'views/home.ejs' をレンダリングして表示します
    res.render('home');
});

// セッションの動作確認用テストルート
app.get('/sessiontest', (req, res) => {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`このページへの訪問は${req.session.count}回目です。`);
});

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
