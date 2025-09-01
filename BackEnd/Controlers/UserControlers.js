const User = require("../Model/UserModel");

// Get all users
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }

    if (!users) {
        return res.status(404).json({ message: "Users not found" });
    }

    return res.status(200).json({ users });
};

// Insert user
const addUsers = async (req, res, next) => {
    const { name, gmail, age, address } = req.body;
    let user;

    try {
        user = new User({ name, gmail, age, address });
        await user.save();
    } catch (err) {
        console.log(err);
    }

    if (!user) {
        return res.status(404).json({ message: "Unable to add user" });
    }

    return res.status(200).json({ user });
};

// Get user by ID ✅ UPDATED RESPONSE KEY
const getbyId = async (req, res, next) => {
    const id = req.params.id;
    let user;

    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // ✅ Fixed: Return as { user }, not { users }
    return res.status(200).json({ user });
};

// Update user
/*
const updateUser = async (req , res , next) => {
    const id = req.params.id;
    const {name,gmail,age,address} = req.body;
    let users;
    try{
        users = await user.findByIdAndUpdate(
            id,
            {name : name ,gmail : gmail ,age : age ,address :address});
            users = await users.save();
    }catch(err){
        console.log(err);
    }
//not updte correctly
if(!users){
    return res.status(404).json({message:"unable update user detail"});
}
    return res.status(200).json({ users });
};
*/

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, gmail, age, address } = req.body;

    let user;

    try {
        user = await User.findByIdAndUpdate(
            id,
            { name, gmail, age, address },
            { new: true } // return updated user
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }

    if (!user) {
        return res.status(404).json({ message: "Unable to update user detail" });
    }

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

    if (!user) {
        return res.status(404).json({ message: "Unable to delete user" });
    }

    return res.status(200).json({ user });
};

// Export functions
exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getbyId = getbyId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
