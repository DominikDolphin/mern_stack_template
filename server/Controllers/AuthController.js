const User = require("../Models/userModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    
    // Ensure required fields are not empty
    if (!email || !password || !username) {
      return res.status(400).json({ message: "There is a missing field in the request"});
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    // istanbul ignore next
    if (!process.env.NODE_ENV=="test") { 
      console.error(error);
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if(!email || !password ){
        return res.status(400).json({message:'All fields are required'})
      }

      const user = await User.findOne({ email });
      if(!user){
        return res.status(404).json({message:'No user registered with this email'}) 
      }

      const auth = await bcrypt.compare(password,user.password)

      if (!auth) {
        return res.status(200).json({message:'Incorrect password'}) 
      }

       const token = createSecretToken(user._id);
       res.cookie("token", token, {
        withCredentials: true,
        httpOnly: false,
       });

       res.status(201).json({ message: "User logged in successfully", success: true });
       next()
    } catch (error) {
      // istanbul ignore next
      if (!process.env.NODE_ENV=="test") {
        console.error(error);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }