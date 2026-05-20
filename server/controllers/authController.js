import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const signup = async (req, res) => {
  try {
    const { name, email, password, calorieGoal } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
    const user = await User.create({ name, email, password, calorieGoal });
    res.status(201).json({ token: generateToken(user._id), user: user.toJSON() });
  } catch (err) { 
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message || 'Error' }); 
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful');
    res.json({ token: generateToken(user._id), user: user.toJSON() });
  } catch (err) { 
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Error' }); 
  }
};
