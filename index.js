// 必要なパッケージを読み込みます
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// 作成したモデルを読み込みます
const Campground = require('./models/campground');

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

// --- ルーティング ---
// トップページ('/')へのGETリクエストが来たときの処理
app.get('/', (req, res) => {
    // 'views/home.ejs' をレンダリングして表示します
    res.render('home');
});

// キャンプ場一覧(Index)ページへのGETリクエスト
app.get('/campgrounds', async (req, res) => {
    // データベースから全てのキャンプ場データを取得します
    const campgrounds = await Campground.find({});
    // 取得したデータを 'campgrounds' という名前でビューに渡し、レンダリングします
    res.render('campgrounds/index', { campgrounds });
});

// 新規登録(New)フォームページへのGETリクエスト
// 注意: このルートは '/campgrounds/:id' よりも先に定義する必要があります
app.get('/campgrounds/new', (req, res) => {
    // 'views/campgrounds/new.ejs' をレンダリングします
    res.render('campgrounds/new');
});

// 新規登録(Create)処理のPOSTリクエスト
app.post('/campgrounds', async (req, res) => {
    try {
        // フォームから送信されたデータ(req.body.campground)を元に新しいモデルインスタンスを作成
        const campground = new Campground(req.body.campground);
        // データベースに保存
        await campground.save();
        // 保存後、作成されたキャンプ場の詳細ページにリダイレクト
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        // Mongooseのバリデーションエラーなどが発生した場合
        console.error("登録エラー:", e);
        res.status(500).send('キャンプ場の登録に失敗しました。入力内容を確認してください。');
    }
});

// 詳細(Show)ページへのGETリクエスト
// '/campgrounds/:id' の :id は、URLの一部を変数として受け取るためのプレースホルダーです
app.get('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            // IDの形式は正しいが、データが見つからなかった場合
            return res.status(404).send('指定されたIDのキャンプ場は見つかりませんでした。');
        }
        res.render('campgrounds/show', { campground });
    } catch (e) {
        // IDの形式が不正などの理由でエラーになった場合
        res.status(404).send('キャンプ場が見つかりませんでした。');
    }
});

// 編集(Edit)フォームページへのGETリクエスト
app.get('/campgrounds/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            return res.status(404).send('編集するキャンプ場が見つかりませんでした。');
        }
        // 'views/campgrounds/edit.ejs' をレンダリングします
        res.render('campgrounds/edit', { campground });
    } catch (e) {
        res.status(404).send('キャンプ場が見つかりませんでした。');
    }
});

// 更新(Update)処理のPUTリクエスト
app.put('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // findByIdAndUpdate(更新対象のid, 更新内容) でデータを検索して更新します
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        // 更新後、詳細ページにリダイレクトします
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
        res.status(500).send('キャンプ場の更新に失敗しました。');
    }
});

// 削除(Delete/Destroy)処理のDELETEリクエスト
app.delete('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // findByIdAndDelete(削除対象のid) でデータを検索して削除します
        await Campground.findByIdAndDelete(id);
        // 削除後、一覧ページにリダイレクトします
        res.redirect('/campgrounds');
    } catch (e) {
        res.status(500).send('キャンプ場の削除に失敗しました。');
    }
});

// --- サーバー起動 ---
const port = 3000;
app.listen(port, () => {
  console.log(`TelpCampサーバーがポート${port}で待機中...`);
});

// picsum.photos (Lorem Picsum) を利用してランダムな画像を表示する場合のURL例
// 例: https://picsum.photos/seed/picsum/200/300
// 例: https://picsum.photos/200/300?grayscale
// 例: https://picsum.photos/200/300/?blur
// 詳細: https://picsum.photos/