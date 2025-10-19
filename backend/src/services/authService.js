const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthService {
  async authenticateUser(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return null;

    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    logger.info('User created in service', { email: user.email });
    return user;
  }

  async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }
}

module.exports = new AuthService();