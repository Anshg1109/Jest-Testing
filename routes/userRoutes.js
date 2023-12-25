const express = require("express");
const {
  registerUser,
  loginUser,
  getUser,
  getUserById ,
  UpdateUser, 
  DeleteUser
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/user/register", registerUser);

router.post("/user/login", loginUser);
router.get("/users", getUser);
router.get("/user/:id", getUserById);
router.put("/user/:id",validateToken, UpdateUser);
router.delete("/user/:id",validateToken, DeleteUser);


module.exports = router;