import { Config, removeBackground } from "@imgly/background-removal";

let config: Config = {
  fetchArgs: {
    mode: "cors",
  },
  model:'isnet_fp16',
  device:'gpu',
  output: {
    quality: 1,
  },
};

/**
 * Remove the background from the provided image.
 * @param {Uint8Array | Blob | string} imageSrc - The source of the image.
 * @returns {Promise<Blob | null>} A promise that resolves to the Blob of the image with the background removed.
 */
export const removeImageBackground = async (
  imageSrc: Uint8Array | Blob | string
): Promise<Blob | null> => {
  try {
    return await removeBackground(imageSrc, config);
  } catch (error) {
    console.error("Error on remove-bg:", error);
    return null;
  }
};
