const API_BASE_URL = 'http://localhost:4000/api';

//get all images
const getImages = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/cloudinary/images`);

    if (!res.ok) {
      throw new Error('Error fetching images');
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch images error', err);
  }
};

//uploadImage file param
const uploadImage = async (file) => {
  if (!file) return alert('Choose a file first');
  const fd = new FormData();
  fd.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}/cloudinary/upload`, {
      method: 'POST',
      body: fd,
      // Note: FormData automatically sets the correct Content-Type header
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    // get URL attribute from the object returned by the backend
    return await res.json();
  } catch (err) {
    console.error(err);
    alert('Upload failed: ' + err.message);
  }
};

//delete image by id
const deleteImage = async (public_id) => {
  if (!window.confirm('Delete this image?')) return;
  try {
    const res = await fetch(
      `${API_BASE_URL}/images/${public_id.replace('Nuclio/cars/', '')}`,
      { method: 'DELETE' },
    );

    if (!res.ok) {
      throw new Error('Delete failed');
    }

    // // remove locally
    // setImages((prev) => prev.filter((img) => img.public_id !== public_id));
    // re-fetch to sync with Cloudinary
    return getImages();
  } catch (err) {
    console.error('Delete failed', err);
    alert('Delete failed');
  }
};

export default { getImages, uploadImage, deleteImage };
