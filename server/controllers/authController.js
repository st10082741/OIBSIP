/*
==============================================================
                AUTHENTICATION CONTROLLER
==============================================================
*/
// Import and generate and verify JWT tokens for user authentication
const jwt = require("jsonwebtoken");

// Import bcrypt for password hashing and comparison
const bcrypt = require("bcrypt");

// Import the User model for database operations
const User = require("../models/User");

// =============================================================
// REGISTER USER
// =============================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user in the database with the hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Initially, the response was returning
    // the user object with the hashed password field included for testing.
    //  To enhance security, we should remove the password field
    //  from the user object before sending the response back to the client.
    //  The commented-out code below shows the original response structure,
    //  which has been modified to exclude the password field.
    /*
return res.status(201).json({
  success: true,
  message: "User registered successfully.",
  user,
});

*/

    // Remove the hashed password field from the user object before sending the response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// LOGIN USER
// =============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
