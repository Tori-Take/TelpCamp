const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// このファイルがどこから呼ばれても環境変数を確実に読み込むために、ここでもdotenvを設定します。
// .envファイルの絶対パスを指定して、読み込みエラーを防ぎます。
// __dirname は現在のファイルがあるディレクトリ(cloudinary)を指すため、'../.env'で親ディレクトリの.envファイルを指定します。
if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Cloudinaryをファイルの保存先として設定します
const storage = new CloudinaryStorage({
    cloudinary, // 上で設定したcloudinaryオブジェクト
    params: {
        folder: 'TelpCamp', // Cloudinary上の保存先フォルダ名
        allowedFormats: ['jpeg', 'png', 'jpg'] // アップロードを許可するファイル形式
    }
});

module.exports = {
    cloudinary,
    storage
};
