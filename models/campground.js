const mongoose = require('mongoose');
const Review = require('./review'); // 追加: Reviewモデルを読み込む
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// 追加: findOneAndDeleteが実行された後に動作するミドルウェア
campgroundSchema.post('findOneAndDelete', async function (doc) {
    // docには削除されたCampgroundドキュメントが渡される
    if (doc) {
        // 削除されたキャンプ場にレビューが含まれていれば
        if (doc.reviews.length) {
            // Reviewモデルから、_idがdoc.reviews配列に含まれるものをすべて削除する
            await Review.deleteMany({
                _id: {
                    $in: doc.reviews
                }
            });
        }
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);
