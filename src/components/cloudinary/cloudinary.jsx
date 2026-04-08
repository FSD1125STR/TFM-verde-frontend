import React, { useState } from 'react';
import { getSignature, uploadToCloudinary } from '../../services/cloudinary';

export default function CloudinaryExample() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Choose a file first');

    try {
      // setUploading(true);
      // setProgress(0);

      // OPTIONAL: choose params you want signed. Validate them on server.
      const toSign = {
        folder: 'demo_uploads',
      };

      const sig = await getSignature(toSign);

      const cloudResponse = await uploadToCloudinary(file, sig, (p) =>
        setProgress(p),
      );
      setUploaded(cloudResponse);
      setFile(null);
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };
}
