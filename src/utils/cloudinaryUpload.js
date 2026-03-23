/**
 * Upload a single file directly to Cloudinary from the browser.
 * Bypasses the backend entirely — no Vercel 4.5MB limit.
 *
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder (e.g. 'hall-booking/halls')
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} - Resolves to the secure Cloudinary URL
 */
export const uploadToCloudinary = (file, folder = "hall-booking/halls", onProgress) => {
  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

/**
 * Upload multiple files to Cloudinary in parallel.
 * @param {File[]} files
 * @param {string} folder
 * @param {function} onProgress - Called with overall progress (0-100)
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export const uploadMultipleToCloudinary = async (files, folder = "hall-booking/halls", onProgress) => {
  const progresses = new Array(files.length).fill(0);

  const updateOverall = () => {
    if (onProgress) {
      const overall = Math.round(progresses.reduce((a, b) => a + b, 0) / files.length);
      onProgress(overall);
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
