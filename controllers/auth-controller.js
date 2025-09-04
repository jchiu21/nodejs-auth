const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    // extract user information from request body
    const { username, email, password, role } = req.body;

    // check if user already exists
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with same username or email",
      });
    }
    // hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user, save in database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await newUser.save();

    if (newUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user! Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // check if user exists in database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }
    // check if password is correct or not
    // compare password input to hashed password in db
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // create user token
    const accessToken = jwt.sign(
      {
        // 1. Payload (data to store)
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      // 2. Secret key (to sign the token)
      process.env.JWT_SECRET_KEY,
      {
        // 3. Options (config)
        expiresIn: "15m",
      }
    );
    res.status(200).json({
      success: true,
      message: "Logged in sucessful",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    // extract old and new password
    const { oldPassword, newPassword } = req.body;
    
    // find the currently logged in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }
    // check if old password is correct
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false, 
        message: "Old password is not correct! Please try again. "
      })
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt)

    // update user password
    user.password = newHashedPassword
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!"
    })

  } catch (error) {}
};

module.exports = { registerUser, loginUser, changePassword };
