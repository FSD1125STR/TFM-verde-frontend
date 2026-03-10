const API_BASE_URL = 'http://localhost:4000/api';

const FOLDERS = {
  CARS: 'cars',
  PROFILES: 'profiles',
  BRANDS: 'brands',
};

// Get all images by folder
const getImages = async (folder) => {
  try {
    if (!FOLDERS[folder]) {
      throw new Error(`Invalid folder: ${folder}`);
    }

    const res = await fetch(`${API_BASE_URL}/cloudinary/images/${folder}`);

    if (!res.ok) {
      throw new Error('Error fetching images');
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch images error', err);
  }
};

// Upload image to specified folder
const uploadImage = async (file, folder) => {
  if (!file) return alert('Choose a file first');

  if (!FOLDERS[folder]) {
    return alert(`Invalid folder: ${folder}`);
  }

  const fd = new FormData();
  fd.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}/cloudinary/upload/${folder}`, {
      method: 'POST',
      body: fd,
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

// Delete image by public_id
const deleteImage = async (public_id, folder) => {
  if (!FOLDERS[folder]) {
    return alert(`Invalid folder: ${folder}`);
  }

  if (!window.confirm('Delete this image?')) return;
  try {
    const res = await fetch(
      `${API_BASE_URL}/images/${public_id.replace(`Nuclio/${folder}/`, '')}`,
      { method: 'DELETE' },
    );

    if (!res.ok) {
      throw new Error('Delete failed');
    }

    // re-fetch to sync with Cloudinary
    return getImages(folder);
  } catch (err) {
    console.error('Delete failed', err);
    alert('Delete failed');
  }
};

export { FOLDERS, getImages, uploadImage, deleteImage };
