const cloudinary = require('cloudinary').v2;
const config = require('./config');
const logger = require('../utils/logger');

const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: config.cloudinaryName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
    logger.info('Cloudinary configured successfully');
  } catch (error) {
    logger.error('Cloudinary configuration error', { error: error.message });
  }
};

const uploadToCloudinary = async (file, folder = 'neurona') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error('Cloudinary upload error', { error: error.message });
    return { success: false, error: error.message };
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    logger.error('Cloudinary delete error', { error: error.message });
    return { success: false, error: error.message };
  }
};

module.exports = {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};