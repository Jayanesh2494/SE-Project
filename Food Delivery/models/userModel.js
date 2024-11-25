const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["incoming", "outgoing"],
    required: [
      true,
      "Transaction type is required and must be either 'incoming' or 'outgoing'.",
    ],
  },
  amount: {
    type: Number,
    required: [true, "Transaction amount is required."],
    min: [0, "Transaction amount must be greater than zero."],
  },
  description: {
    type: String,
    required: [true, "Transaction description is required."],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: [true, "This email is already registered."],
  },
  phoneNo: {
    type: String,
    required: [true, "Phone number is required."],
    unique: [true, "This phone number is already registered."],
  },
  aadhar: {
    type: String,
    unique: [true, "This Aadhar number is already registered."],
  },
  organisation: {
    type: String,
    default: "individual",
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: {
      values: ["donor", "rider", "recipient", "user", "admin"],
      message: "Role must be either 'donor', 'rider', 'recipient', or 'user'.",
    },
    default: "user",
  },
  humanityCoinBalance: {
    type: Number,
    default: 0,
  },
  transactionHistory: [transactionSchema],
  password: {
    type: String,
    required: [true, "Password is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET, // Secret key, make sure to set this in environment variables
    { expiresIn: "1d" } // Token expiration
  );
  return token;
};

// Method to increase Humanity Coin balance
userSchema.methods.addHumanityCoins = async function (amount, description) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero to add coins.");
  }

  // Add to balance
  this.humanityCoinBalance += amount;

  // Record transaction
  this.transactionHistory.push({
    type: "incoming",
    amount,
    description,
  });

  // Save user
  try {
    await this.save();
  } catch (err) {
    throw new Error("Error saving transaction: " + err.message);
  }
};

// Method to decrease Humanity Coin balance
userSchema.methods.subtractHumanityCoins = async function (
  amount,
  description
) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero to subtract coins.");
  }

  if (this.humanityCoinBalance < amount) {
    throw new Error("Insufficient balance to complete the transaction.");
  }

  // Subtract from balance
  this.humanityCoinBalance -= amount;

  // Record transaction
  this.transactionHistory.push({
    type: "outgoing",
    amount,
    description,
  });

  // Save user
  try {
    await this.save();
  } catch (err) {
    throw new Error("Error saving transaction: " + err.message);
  }
};

// Create or retrieve the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
