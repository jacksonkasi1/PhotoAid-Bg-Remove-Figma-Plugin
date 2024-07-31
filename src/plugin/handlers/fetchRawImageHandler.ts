/**
 * Fetches the raw image data from the selected node in Figma.
 * @param {SceneNode} node - The node from which to fetch the raw image data.
 * @returns {Promise<Uint8Array | null>} A promise that resolves to the raw image data.
 */
export const fetchRawImage = async (node: SceneNode): Promise<Uint8Array | null> => {
  if ("exportAsync" in node) {
    return await node.exportAsync({ format: 'PNG' });
  }
  return null;
};
