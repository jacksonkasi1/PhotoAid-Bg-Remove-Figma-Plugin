// ** import helpers
import { getImageNode } from './handlers/fetchImagesHandlers';

/**
 * Initializes the Figma plugin.
 * Sets the initial dimensions of the plugin UI, fetches the image node from the selected frame or group,
 * and sends the image data to the plugin UI.
 */
const initializePlugin = async () => {
  const storedWidth = await figma.clientStorage.getAsync('pluginWidth');
  const storedHeight = await figma.clientStorage.getAsync('pluginHeight');
  const width = storedWidth ? storedWidth : 300;
  const height = storedHeight ? storedHeight : 350;
  figma.showUI(__html__, { width, height });

  const selectedNodes = figma.currentPage.selection;
  if (selectedNodes.length > 0) {
    const node = selectedNodes[0];
    const imageNode = await getImageNode(node);
    if (imageNode) {
      figma.ui.postMessage({ type: 'FETCH_IMAGE_NODE', data: imageNode });
    }
  }

  figma.ui.postMessage({ type: 'INITIAL_DIMENSIONS', data: { width, height } });
};

initializePlugin();

/**
 * Handles messages from the plugin UI.
 * Resizes the plugin UI and saves the new dimensions in client storage.
 * @param {any} msg - The message from the plugin UI.
 */
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(300, msg.width);
    const height = Math.max(350, msg.height);
    figma.ui.resize(width, height);
    await figma.clientStorage.setAsync('pluginWidth', width);
    await figma.clientStorage.setAsync('pluginHeight', height);
  }
};

/**
 * Handles selection changes in the Figma document.
 * Fetches the image node from the selected frame or group and sends the image data to the plugin UI.
 */
figma.on('selectionchange', async () => {
  const selectedNodes = figma.currentPage.selection;
  if (selectedNodes.length > 0) {
    const node = selectedNodes[0];
    const imageNode = await getImageNode(node);
    if (imageNode) {
      figma.ui.postMessage({ type: 'FETCH_IMAGE_NODE', data: imageNode });
    }
  }
});
