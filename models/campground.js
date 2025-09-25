const mongoose = require('mongoose');
const Review = require('./review'); // 追加: Reviewモデルを読み込む
const Schema = mongoose.Schema;
const { cloudinary } = require('../Cloudinary');

const campgroundSchema = new Schema({
    name: { type: String, required: true },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    location: { type: String, required: true },
    author: { // このフィールドを追加
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
        // 関連するレビューを削除
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
        // 関連する画像をCloudinaryから削除
        for (const img of doc.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);
