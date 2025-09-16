const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// キャンプ場のデータ構造を定義します
const CampgroundSchema = new Schema({
    name: {
        type: String,
        required: true // 必須項目
    },
    location: {
        type: String,
        required: true // 必須項目
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
        required: true // 必須項目
    },
    description: {
        type: String
        // required: true を付けないので、この項目は任意になります
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Campgroundが削除されたら、関連するReviewも削除するミドルウェア
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

// 定義したスキーマを元にモデルを作成し、エクスポートします
module.exports = mongoose.model('Campground', CampgroundSchema);
