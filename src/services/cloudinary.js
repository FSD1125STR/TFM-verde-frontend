const API_BASE_URL = 'http://localhost:3000/api';

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

// signed endpoints
const getSignature = async (params = {}) => {
  // Call your server to get signature. Include any params you want signed (folder, public_id)
  const res = await fetch(`${API_BASE_URL}/api/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // send your auth token/cookie. For the demo server we use a demo header:
      'x-taller-auth': 'letmeupload',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Could not get signature: ' + text);
  }
  return res.json();
};

const uploadToCloudinary = (file, signatureResponse, onProgress) => {
  return new Promise((resolve, reject) => {
    const {
      signature,
      timestamp,
      api_key,
      cloud_name,
      folder,
      public_id,
      eager,
    } = signatureResponse;

    const url = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
    const fd = new FormData();

    fd.append('file', file);
    fd.append('api_key', api_key);
    fd.append('timestamp', timestamp);
    fd.append('signature', signature);

    // If your server asked to include folder/public_id/eager, append them
    if (folder) fd.append('folder', folder);
    if (public_id) fd.append('public_id', public_id);
    if (eager) fd.append('eager', eager);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json); // Cloudinary response object
        } catch (err) {
          resolve(xhr.responseText);
        }
      } else {
        reject(
          new Error(
            `Upload failed: ${xhr.status} ${xhr.statusText} ${xhr.responseText}`,
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
};

export {
  FOLDERS,
  getImages,
  uploadImage,
  deleteImage,
  getSignature,
  uploadToCloudinary,
};
