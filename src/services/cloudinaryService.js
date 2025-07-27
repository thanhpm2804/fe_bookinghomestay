// Upload ảnh lên Cloudinary
export const uploadImageToCloudinary = async (file) => {
  try {
    console.log('Bắt đầu upload file:', file.name, 'Size:', file.size);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'homestay_upload'); // Cần tạo preset này trong Cloudinary

    console.log('Upload URL:', `https://api.cloudinary.com/v1_1/duexiutqy/image/upload`);
    console.log('Upload preset:', 'homestay_upload');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/duexiutqy/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status);
      console.error('Error response:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json(); 
    console.log('Upload success:', data.secure_url);
    return data.secure_url; // Trả về URL ảnh
  } catch (error) {
    console.error('Upload error details:', error);
    throw new Error(`Upload ảnh thất bại: ${error.message}. Vui lòng kiểm tra cấu hình Cloudinary.`);
  }
};

// Upload nhiều ảnh
export const uploadMultipleImages = async (files) => {
  try {
    console.log('Bắt đầu upload', files.length, 'files');
    const uploadPromises = files.map((file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);
      return uploadImageToCloudinary(file);
    });
    const urls = await Promise.all(uploadPromises);
    console.log('Upload thành công', urls.length, 'files');
    return urls;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
}; 