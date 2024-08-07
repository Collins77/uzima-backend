const mongoose = require('mongoose');

const userChatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    threadId: { type: String, required: true },
}, {timestamps: true});

const userChats = mongoose.model('userChats', userChatsSchema);

module.exports = userChats;