function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e));
    }
}

module.exports = wrapAsync;
// 非同期関数をラップし、エラーをnextに渡すミドルウェア