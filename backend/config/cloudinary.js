import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
  const env = process.env;

  // Accept standard names, legacy names, or a single CLOUDINARY_URL
  const cloudName = (env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_NAME || '').trim();
  const apiKey = (env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (env.CLOUDINARY_API_SECRET || env.CLOUDINARY_SECRET_KEY || '').trim();
  const url = (env.CLOUDINARY_URL || '').trim();

  if (url) {
    // Let SDK parse from CLOUDINARY_URL
    process.env.CLOUDINARY_URL = url;
    cloudinary.config({ secure: true });
  } else {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary env. Provide either CLOUDINARY_URL, or all of: ' +
        'CLOUDINARY_CLOUD_NAME (or CLOUDINARY_NAME), CLOUDINARY_API_KEY, ' +
        'CLOUDINARY_API_SECRET (or CLOUDINARY_SECRET_KEY).'
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
  console.log('Connected to Cloudinary');
};

export default connectCloudinary;