/*
==============================================================
                AUTHENTICATION CONTROLLER
==============================================================

This controller handles customer authentication.

Current responsibilities:
• Register users
• Send email verification links
• Verify email addresses
• Login verified users
• Generate JWT tokens
• Handle forgot-password requests

==============================================================
*/

// Import JWT for creating login tokens.
const jwt = require("jsonwebtoken");

// Import bcrypt for hashing and comparing passwords.
const bcrypt = require("bcrypt");

// Import Node's built-in crypto module for secure tokens.
const crypto = require("crypto");

// Import the User model for MongoDB operations.
const User = require("../models/User");

// Import the reusable email-sending function.
const sendEmail = require("../config/email");

// =============================================================
// REGISTER USER
// =============================================================

const registerUser = async (req, res) => {
  try {
    // Read registration information from the request body.
    const { name, email, password } = req.body;

    // Check whether the email address is already registered.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Hash the password before saving it.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a secure token for email verification.
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Save the unverified user in MongoDB.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Create the backend email-verification link.
    const verificationURL = `${process.env.SERVER_URL}/api/auth/verify-email/${verificationToken}`;

    // Send the verification email.
    await sendEmail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Victor's Pizza Delivery 🍕</h2>

          <p>
            Thank you for registering. Please verify your email address
            before signing in.
          </p>

          <p>
            <a
              href="${verificationURL}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #f97316;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            If the button does not work, copy and paste this link:
          </p>

          <p>${verificationURL}</p>
        </div>
      `,
    });

    // Return only safe information to the client.
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
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
// VERIFY USER EMAIL
// =============================================================

const verifyEmail = async (req, res) => {
  try {
    // Read the verification token from the URL.
    const { token } = req.params;

    // Find the account connected to this token.
    const user = await User.findOne({
      verificationToken: token,
    });

    // Reject an invalid or previously used token.
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    // Activate the account.
    user.isVerified = true;

    // Clear the token so it cannot be used again.
    user.verificationToken = "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
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
    // Read login details from the request body.
    const { email, password } = req.body;

    // Find the user by email address.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Block login until the email address is verified.
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Compare the submitted password with the stored hash.
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate a JWT that expires after seven days.
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Return the JWT together with safe user information.
    // The frontend can immediately display the user's details
    // without making another API request.
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// FORGOT PASSWORD
// =============================================================

const forgotPassword = async (req, res) => {
  try {
    // Read the email submitted by the user.
    const { email } = req.body;

    // Search for the account connected to the email.
    const user = await User.findOne({ email });

    /*
    Return the same message whether the account exists or not.

    This prevents attackers from using the endpoint to discover
    which email addresses are registered in the application.
    */
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Generate the token that will be placed in the email link.
    const resetToken = crypto.randomBytes(32).toString("hex");

    /*
    Store only a SHA-256 hash of the reset token.

    If the database is exposed, the original reset token
    cannot be copied directly from the database and used.
    */
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save the hashed token.
    user.resetPasswordToken = hashedResetToken;

    // Make the reset token expire after one hour.
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    // The original token is placed in the link sent to the user.
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      // Send the password-reset email.
      await sendEmail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset Your Password 🔐</h2>

            <p>
              We received a request to reset the password for your
              Victor's Pizza Delivery account.
            </p>

            <p>
              This link will expire in one hour.
            </p>

            <p>
              <a
                href="${resetURL}"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: #f97316;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </p>

            <p>
              If the button does not work, copy and paste this link:
            </p>

            <p>${resetURL}</p>

            <p>
              If you did not request a password reset, ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      /*
      Clear the reset information if sending the email fails.

      This prevents an unusable reset token from remaining active.
      */
      user.resetPasswordToken = "";
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "The password reset email could not be sent.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================================
// RESET PASSWORD
// =============================================================

const resetPassword = async (req, res) => {
  try {
    // Read the original reset token from the URL.
    const { token } = req.params;

    // Read the new password sent in the request body.
    const { password } = req.body;

    // Ensure a new password was provided.
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password.",
      });
    }

    // Require a reasonable minimum password length.
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    /*
    Hash the token received from the URL.

    The database contains only the hashed version of the token,
    so we must hash the submitted token before searching for it.
    */
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    /*
    Find a user whose reset token matches and has not expired.

    $gt means the expiration time must be greater than
    the current time.
    */
    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    // Reject invalid, already-used or expired reset links.
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    // Hash the new password before saving it.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Replace the old password with the new secure hash.
    user.password = hashedPassword;

    // Clear the reset token so it cannot be reused.
    user.resetPasswordToken = "";

    // Remove the reset token expiration time.
    user.resetPasswordExpires = undefined;

    // Save the updated user in MongoDB.
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export the controller functions for use in the routes.
module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
};
