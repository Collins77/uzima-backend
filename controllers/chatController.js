const chat = require('../model/Chat.js');
const userChats = require('../model/UserChats.js');


const createChat = async (req, res) => {
    const userId = req.user.userId;
    const { text } = req.body;

    try {
        const newChat = new chat({
            userId,
            history: [{ role: "user", parts: [{ text }] }]
        });

        const savedChat = await newChat.save();

        const UserChats = await userChats.find({ userId });

        if (!UserChats.length) {
            const newUserChats = new userChats({
                userId,
                chats: [{ _id: savedChat.id, title: text.substring(0, 40) }]
            });
            await newUserChats.save();
        } else {
            await userChats.updateOne({ userId }, {
                $push: {
                    chats: { _id: savedChat._id, title: text.substring(0, 40) }
                }
            });
        }

        res.status(201).send(newChat._id);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating chat");
    }
};

const getChat = async (req, res) => {
    const userId = req.user.userId;
    try {
        const Chat = await chat.findOne({ _id: req.params.id, userId });
        res.status(200).send(Chat);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching chat!");
    }
};

const updateChat = async (req, res) => {
    const userId = req.user.userId;
    const { question, answer, img } = req.body;
    const newItems = [
        ...(question ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }] : []),
        { role: "model", parts: [{ text: answer }] }
    ];

    try {
        const updatedChat = await chat.updateOne({ _id: req.params.id, userId }, {
            $push: {
                history: { $each: newItems }
            }
        });
        res.status(200).send(updatedChat);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding conversation");
    }
};

module.exports = {createChat, getChat, updateChat};