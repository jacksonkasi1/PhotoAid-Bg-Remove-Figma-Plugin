import { getImageNode } from './handlers/fetchImagesHandlers';
import { fetchRawImage } from './handlers/fetchRawImageHandler';

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
 * Replaces the image in Figma with the background removed image.
 * Shows error messages using figma.notify.
 * @param {any} msg - The message from the plugin UI.
 */
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(300, msg.width);
    const height = Math.max(350, msg.height);
    figma.ui.resize(width, height);
    await figma.clientStorage.setAsync('pluginWidth', width);
    await figma.clientStorage.setAsync('pluginHeight', height);
  } else if (msg.type === 'FETCH_RAW_IMAGE') {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length > 0) {
      const node = selectedNodes[0];
      const rawImageData = await fetchRawImage(node);
      if (rawImageData) {
        figma.ui.postMessage({ type: 'RAW_IMAGE_DATA', data: rawImageData });
      }
    }
  } else if (msg.type === 'REPLACE_IMAGE') {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length > 0) {
      // const node = selectedNodes[0];
      // if ("fills" in node && node.fills.length > 0) {
      //   const imageFill = node.fills.find(fill => fill.type === 'IMAGE');
      //   if (imageFill) {
      //     const newPaint = { ...imageFill, imageHash: figma.createImage(msg.data).hash };
      //     node.fills = [newPaint];
      //   }
      // }
    }
  } else if (msg.type === 'SHOW_ERROR') {
    figma.notify(msg.message);
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
