const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const safeUser = require('../utils/safeUser');
const { validateUserPayload } = require('../utils/validation');
const { hashPassword } = require('../utils/password');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const validation = validateUserPayload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const { password, ...userData } = validation.normalized;
    const passwordHash = await hashPassword(password);
    const user = await User.create({ ...userData, passwordHash });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: safeUser(user)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'email/login ID';
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`
      });
    }
    return next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      count: users.length,
      data: users.map(safeUser)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
