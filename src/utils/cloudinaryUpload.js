import imageCompression from "browser-image-compression";

const compressImage = async (file) => {
  // Skip compression for small files < 1MB
  if (file.size < 1 * 1024 * 1024) return file;
  return imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
};

export const uploadToCloudinary = async (file, folder = "hall-booking/halls", onProgress) => {
  const compressed = await compressImage(file);

  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

export const uploadMultipleToCloudinary = async (files, folder = "hall-booking/halls", onProgress) => {
  const progresses = new Array(files.length).fill(0);

  const updateOverall = () => {
    if (onProgress) {
      onProgress(Math.round(progresses.reduce((a, b) => a + b, 0) / files.length));
    }
  };

  return Promise.all(
    files.map((file, i) =>
      uploadToCloudinary(file, folder, (p) => {
        progresses[i] = p;
        updateOverall();
      })
    )
  );
};
