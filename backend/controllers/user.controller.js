import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Simulated OTP store (use Redis or DB in production)
const otpStore = {};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already registered", success: false });
    }

    // Save OTP (simulated)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      userData: { name, email, password, role, avatar: req.file?.path || "" },
    };

    console.log("OTP sent (for testing):", otp); // Replace with actual email/SMS

    res.status(200).json({ message: "OTP sent", success: true });
  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    const hashedPassword = await bcrypt.hash(record.userData.password, 10);
    const newUser = await User.create({
      ...record.userData,
      password: hashedPassword,
    });

    delete otpStore[email];

    res
      .status(201)
      .json({ message: "User registered", user: newUser, success: true });
  } catch (error) {
    console.log("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful", user, success: true });
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.log("Logout Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (req.file?.path) {
      user.avatar = req.file.path;
    }

    await user.save();

    res.status(200).json({ message: "Profile updated", user, success: true });
  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
