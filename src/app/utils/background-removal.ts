import axios from 'axios';

/**
 * Validates and cleans the base64 string by removing the prefix if present.
 * @param {string} base64Image - The base64 encoded image.
 * @returns {string} - The cleaned base64 string.
 */
const validateAndCleanBase64 = (base64Image: string): string => {
  const base64Pattern = /^data:application\/octet-stream;base64,/;
  if (base64Pattern.test(base64Image)) {
    return base64Image.replace(base64Pattern, '');
  }
  return base64Image;
};

/**
 * Uploads the base64 image to the background removal API.
 * @param {string} base64Image - The base64 encoded image.
 * @returns {Promise<string | null>} - The request ID from the API or null if an error occurred.
 */
export const uploadImageForBackgroundRemoval = async (base64Image: string): Promise<string | null> => {
  const reqURL = "/remove-background/upload";
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZWNyZXQtNWI0NzAxMTAtNmVjNi00ODUyLTk1ZDUtOTY3ODhlMjZjZGVhIiwiZXhwIjoxNzIyNzEyOTMzfQ.q3iCz3ssiOeqxHsMg5opUKHRRDNCONmlen73GUEAzrg";

  const cleanBase64 = validateAndCleanBase64(base64Image);

  if (!cleanBase64) {
    console.error("Invalid base64 image data");
    return null;
  }

  try {
    const response = await axios.post('https://photoaid.com/en/tools/api/tools/upload', {
      base64: cleanBase64,
      reqURL: reqURL,
      token: token
    }, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });

    if (response.data && response.data.status === 200) {
      return response.data.request_id;
    } else {
      console.error("Error uploading image for background removal:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error uploading image for background removal:", error);
    return null;
  }
};

/**
 * Retrieves the result image from the background removal API.
 * @param {string} requestId - The request ID from the upload API.
 * @param {number} [retries=5] - The number of retries to attempt.
 * @returns {Promise<string | null>} - The base64 encoded result image or null if an error occurred.
 */
export const getBackgroundRemovalResult = async (requestId: string, retries: number = 5): Promise<string | null> => {
  try {
    const response = await axios.post('https://photoaid.com/en/tools/api/tools/result', {
      request_id: requestId,
      reqURL: "/remove-background/result"
    }, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    if (response.data && response.data.status === 200) {
      if (response.data.statusAPI === "ready") {
        return response.data.result;
      } else if (response.data.statusAPI === "processing" && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return await getBackgroundRemovalResult(requestId, retries - 1);
      } else {
        console.error("Error: Background removal processing failed after retries:", response.data);
        return null;
      }
    } else {
      console.error("Error getting background removal result:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error getting background removal result:", error);
    return null;
  }
};
