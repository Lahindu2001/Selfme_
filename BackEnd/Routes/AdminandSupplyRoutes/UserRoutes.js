const express = require("express");
router = express.Router();
//insert Model
const User = require("../../Model/AdminandSupplyModel/UserModel") ;
//insert user controller+
const UserController = require("../../Controllers/AdminandSupplyControllers/UserControlers");

router.get("/",UserController.getAllUsers);
router.post("/",UserController.addUsers);
router.get("/:id",UserController.getbyId);
router.put("/:id",UserController.updateUser);
router.delete("/:id",UserController.deleteUser);

//export
module.exports = router;

