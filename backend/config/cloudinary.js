const connectCloudinary = async () => {
  const env = process.env;

  const cloudName = (env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_NAME || '').trim();
  const apiKey = (env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (env.CLOUDINARY_API_SECRET || env.CLOUDINARY_SECRET_KEY || '').trim();
  const url = (env.CLOUDINARY_URL || '').trim();

  if (url) {
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
  
  try {
    const pingResult = await cloudinary.api.ping();
    console.log('Cloudinary connection verified:', pingResult.status);
  } catch (error) {
    console.error('Cloudinary connection failed:', error.message);
  }
};

export default connectCloudinary;