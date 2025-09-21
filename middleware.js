module.exports.isLoggedIn = (req, res, next) => {
    // Passportが提供するisAuthenticated()でログイン状態をチェック
    if (!req.isAuthenticated()) {
        // ユーザーが元々アクセスしようとしていたURLをセッションに保存
        req.session.returnTo = req.originalUrl;
        // ログインしていなければ、エラーメッセージをフラッシュに保存してログインページへリダイレクト
        req.flash('error', 'この操作を行うにはログインしてください。');
        return res.redirect('/login');
    }
    // ログインしていれば、次の処理（ルートハンドラなど）へ進む
    next();
}
