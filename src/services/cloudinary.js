import instance from './axios';

//get all images
const getImages = async () => {
  try {
    const res = await instance.get(
      'http://localhost:4000/api/cloudinary/images',
    );

    return res.data;
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
    const res = await instance.post(
      'http://localhost:4000/api/cloudinary/upload',
      fd,
      {
        // onUploadProgress: (event) => {
        //   console.log('this is the event on upload progress', event);
        //   const percent = Math.round((event.loaded * 100) / event.total);
        //   setProgress(percent);
        // },
      },
    );
    // get URL attribute from the object returned by the backend
    return res;
  } catch (err) {
    console.error(err);
    alert('Upload failed: ' + (err.response?.data?.error || err.message));
  }
};

//delete image by id
const deleteImage = async (public_id) => {
  if (!window.confirm('Delete this image?')) return;
  try {
    await instance.delete(
      `http://localhost:4000/api/images/${public_id.replace('Nuclio/cars/', '')}`,
    );
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
