const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    }
});

// 定義したスキーマを元にモデルを作成し、エクスポートします
module.exports = mongoose.model('Campground', CampgroundSchema);
