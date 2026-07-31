const mongoose = require('mongoose');
const {
  EMAIL_REGEX,
  LOGIN_ID_REGEX,
  MOBILE_REGEX,
  NAME_REGEX
} = require('../utils/validation');

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true, maxlength: 150 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    country: { type: String, required: true, trim: true, maxlength: 80 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      match: [NAME_REGEX, 'Invalid first name.']
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      match: [NAME_REGEX, 'Invalid last name.']
    },
    mobile: {
      type: String,
      required: true,
      match: [MOBILE_REGEX, 'Mobile number must contain exactly 10 digits.']
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Invalid email address.']
    },
    address: {
      type: addressSchema,
      required: true
    },
    loginId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [LOGIN_ID_REGEX, 'Login ID must be exactly 8 alphanumeric characters.']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model('User', userSchema);
