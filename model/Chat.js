const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true,
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    },
                },
            ],
            img: {
                type: String,
                required: false,
            },
        },
    ],
}, {timestamps: true});

const chat = mongoose.model('chat', chatSchema);

module.exports = chat;