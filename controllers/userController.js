const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register a user
//@route POST /api/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password ,phone,role} = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are mandatory!" });

  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    return res.status(400).json({ message: "User already registered!" });

  }

  //Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role
  });

  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    return res.status(400).json({ message: "User data is not valid" });

  }
});

//@desc Login user
//@route POST /api/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await User.findOne({ email });
  //compare password with hashedpassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECERT,
      { expiresIn: "15m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});


//@desc All user info
//@route GET /api/users/
//@access public
const getUser = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//@desc user info by id
//@route GET /api/user/:id
//@access public
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

//@desc Update user info
//@route PUT /api/user/:id
//@access private
const UpdateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, password, role } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user properties if provided in the request body
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//@desc Delete user info
//@route DELETE /api/user/:id
//@access private
const DeleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { registerUser, loginUser,getUser,getUserById ,UpdateUser, DeleteUser};