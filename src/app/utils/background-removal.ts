import { Config, removeBackground } from '@imgly/background-removal';

let config: Config = {
  model: 'isnet_quint8',
  device: 'cpu',
  output: {
    format: 'image/png', // Ensure the output is in PNG for lossless quality
    quality: 1.0, // Set the highest quality
  },
};

/**
 * Remove the background from the provided image.
 * @param {Uint8Array | Blob | string} imageSrc - The source of the image.
 * @returns {Promise<Blob | null>} A promise that resolves to the Blob of the image with the background removed.
 */
export const removeImageBackground = async (imageSrc: Uint8Array | Blob | string): Promise<Blob | null> => {
  try {
    return await removeBackground(imageSrc, config);
  } catch (error) {
    console.error('Error on remove-bg:', error);
    parent.postMessage({ pluginMessage: { type: 'SHOW_ERROR', message: 'Failed to remove background' } }, '*');
    return null;
  }
};
