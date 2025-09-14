class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); // 親クラスであるErrorのコンストラクタを呼び出します
        this.message = message; // エラーメッセージを設定します
        this.statusCode = statusCode; // HTTPステータスコードを設定します
    }
}

module.exports = ExpressError;
