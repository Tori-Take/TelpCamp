const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// これをプラグインとして使用すると、UserSchemaにusername, hash, saltフィールドが自動で追加されます。
UserSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'そのユーザー名はすでに使用されています。',
        MissingPasswordError: 'パスワードが入力されていません。',
        AttemptTooSoonError: 'アカウントがロックされています。時間をおいて再度お試しください。',
        TooManyAttemptsError: 'ログインの試行回数が多すぎます。時間をおいて再度お試しください。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が正しくありません。',
        IncorrectUsernameError: 'パスワードまたはユーザー名が正しくありません。',
        MissingUsernameError: 'ユーザー名が入力されていません。'
    }
});

module.exports = mongoose.model('User', UserSchema);