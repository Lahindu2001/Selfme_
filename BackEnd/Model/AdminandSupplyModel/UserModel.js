const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_number: { type: String, required: true },  
    username: { type: String, required: true },     
    password: { type: String, required: true },     
    full_name: { type: String, required: true },     
    email: { type: String, required: true },         
    phone: { type: String, required: true },         
    address: { type: String, required: true },       
    role: { type: String, enum: ['Admin','Inventory Manager','Finance Manager','Technician','Customer'], required: true },
    status: { type: String, enum: ['Active','Inactive'], default: 'Active' },
    created_at: { type: Date, default: Date.now }    
});

module.exports = mongoose.model("UserModel", userSchema);
