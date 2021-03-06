const mongoose = require("mongoose");

const userScheme = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  street: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  token: {
    type: String,
    expires: 36000,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
});
userScheme.virtual("id").get(function () {
  return this._id.toHexString();
});
userScheme.set("toJSON", {
  virtuals: true,
});
exports.User = mongoose.model("users", userScheme);
