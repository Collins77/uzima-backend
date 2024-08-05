const userChats = require("../model/UserChats");

const getUserChats = async (req, res) => {
    const userId = req.user.userId;
    try {
        const UserChats = await userChats.find({ userId });
        res.status(200).send(UserChats[0].chats);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching user chats");
    }
};

module.exports = {getUserChats};
