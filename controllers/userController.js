const UserModel = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log(name, email);

    // Check if the user already exists
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create a new user if not found
    user = new UserModel({ name, email });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
