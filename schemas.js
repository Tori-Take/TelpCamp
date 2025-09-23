const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array().items(Joi.string())
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5).messages({
            'number.base': '評価は数字で入力してください。',
            'any.required': '評価は必須です。',
            'number.min': '評価は1以上で入力してください。',
            'number.max': '評価は5以下で入力してください。'
        }),
        body: Joi.string().required().messages({
            'string.empty': 'コメントを入力してください。'
        })
    }).required()
});
