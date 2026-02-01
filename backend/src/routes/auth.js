import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getUserByUsername } from '../services/dataStore.js';

const router = express.Router();

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = value;
    const user = getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against hash
    const bcrypt = await import('bcryptjs');
    const validPassword = bcrypt.default.compareSync(password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      expiresIn: 3600
    });
  } catch (err) {
    next(err);
  }
});

export default router;
