export const getCroppedImg = (imageSrc, cropAreaPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropAreaPixels.width;
        canvas.height = cropAreaPixels.height;
        const ctx = canvas.getContext('2d');
  
        ctx.drawImage(
          image,
          cropAreaPixels.x,
          cropAreaPixels.y,
          cropAreaPixels.width,
          cropAreaPixels.height,
          0,
          0,
          cropAreaPixels.width,
          cropAreaPixels.height
        );
  
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas is empty'));
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        }, 'image/jpeg');
      };
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };
  