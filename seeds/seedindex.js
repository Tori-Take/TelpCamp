const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places, descriptions } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/telp-camp')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

// 配列からランダムな要素を1つ取り出すヘルパー関数
const sample = array => array[Math.floor(Math.random() * array.length)];

// データベースに初期データを投入する非同期関数
const seedDB = async () => {
    // 既存のキャンプ場データを全て削除します
    await Campground.deleteMany({});
    // 50件のサンプルデータを作成・保存します
    for (let i = 0; i < 50; i++) {
        // cities配列からランダムな都市のインデックスを取得
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        // 1000円から5999円のランダムな価格を生成
        const price = Math.floor(Math.random() * 5000) + 1000;
        const camp = new Campground({
            // 例: 「北海道札幌市」
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            // 例: 「サイレント・キャンプ」
            name: `${sample(descriptors)}・${sample(places)}`,
            // picsum.photosからランダムな画像を取得するURL。ループのインデックスiを使ってユニークな画像を生成します。
            image: `https://picsum.photos/800/600?random=${i}`,
            price: price,
            description: sample(descriptions)
        });
        await camp.save();
    }
    console.log('初期データの投入に成功しました。');
};

// seedDB関数を実行し、完了したらデータベース接続を閉じます
seedDB().then(() => {
    mongoose.connection.close();
});
