// 必要なパッケージを読み込みます
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError'); // 作成したExpressErrorを読み込み

// ルーターを読み込みます
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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

// --- ルーティング ---
// ルーターを使用する
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// トップページ('/')へのGETリクエストが来たときの処理
app.get('/', (req, res) => {
    // 'views/home.ejs' をレンダリングして表示します
    res.render('home');
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
