const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.js");
module.exports = {
  users: () => {
    return User.find()
      .then((users) => {
        return users.map((user) => {
          return { ...user._doc, _id: user.id };
        });
      })
      .catch((error) => {
        throw error;
      });
  },
  signup: (args) => {
    return User.findOne({ email: args.userInput.email })
      .then((user) => {
        if (user) {
          throw new Error("User already exists");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then((hashedPassword) => {
        const user = new User({
          name: args.userInput.name,
          email: args.userInput.email,
          password: hashedPassword,
        });
        return user.save();
      })
      .then((results) => {
        return { ...results._doc, _id: results.id };
      })
      .catch((error) => {
        throw error;
      });
  },
  login: async (args) => {
    const user = await User.findOne({ email: args.userInput.email });
    if (!user) {
      throw new Error("Auth Failed");
    }
    const checkPassword = await bcrypt.compare(
      args.userInput.password,
      user.password
    );
    if (!checkPassword) {
      throw new Error("Auth failed");
    }
    const token = jwt.sign(
      { email: args.userInput.email, _id: user._id },
      "secret",
      {
        expiresIn: "3hr",
      }
    );
    return { userEmail: args.userInput.email, token: token, userId: user._id };
  },
};
