const User = require("../../Model/AdminandSupplyModel/UserModel");

// Get all users
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }
    if (!users) return res.status(404).json({ message: "Users not found" });
    return res.status(200).json({ users });
};

// Insert user
const addUsers = async (req, res, next) => {
    const { user_number, username, password, full_name, email, phone, address, role, status } = req.body;
    let user;
    try {
        user = new User({ user_number, username, password, full_name, email, phone, address, role, status });
        await user.save();
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "Unable to add user" });
    return res.status(200).json({ user });
};

// Get user by ID
const getbyId = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
};

// Update user
const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { user_number, username, password, full_name, email, phone, address, role, status } = req.body;
    let user;
    try {
        user = await User.findByIdAndUpdate(
            id,
            { user_number, username, password, full_name, email, phone, address, role, status },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
    if (!user) return res.status(404).json({ message: "Unable to update user detail" });
    return res.status(200).json({ user });
};

// Delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "Unable to delete user" });
    return res.status(200).json({ user });
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getbyId = getbyId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
