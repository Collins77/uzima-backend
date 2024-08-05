const mongoose = require('mongoose');

const userChatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chats: [
        {
            _id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now(),
            },
            
        },
    ],
}, {timestamps: true});

const userChats = mongoose.model('userChats', userChatsSchema);

module.exports = userChats;