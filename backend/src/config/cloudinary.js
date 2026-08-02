const cloudinary = require('cloudinary').v2;

const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary initialized');
};

const uploadImage = async (filePath, folder = 'staygen') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const uploadImageBuffer = async (buffer, folder = 'staygen', mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { initCloudinary, uploadImage, uploadImageBuffer, deleteImage };
