/**
 * Get the MIME type based on the file format.
 * @param {string} [format] - The file format.
 * @returns {string} The MIME type.
 */
export const getMimeType = (format?: string): string => {
  switch (format?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Convert an ArrayBuffer to a Base64 string.
 * @param {Uint8Array} buffer - The buffer to convert.
 * @param {string} [format] - The format of the image.
 * @returns {Promise<string>} A promise that resolves to the Base64 string.
 */
export const arrayBufferToBase64 = (buffer: Uint8Array, format?: string): Promise<string> => {
  const mimeType = getMimeType(format);
  const blob = new Blob([buffer], { type: mimeType });
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject('Error converting buffer to base64');
      }
    };
    reader.readAsDataURL(blob);
  });
};
