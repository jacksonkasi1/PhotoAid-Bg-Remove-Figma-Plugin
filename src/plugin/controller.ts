import { getImageNode } from './handlers/fetchImagesHandlers';

figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(300, msg.width);
    const height = Math.max(350, msg.height);
    figma.ui.resize(width, height);
    await figma.clientStorage.setAsync('pluginWidth', width);
    await figma.clientStorage.setAsync('pluginHeight', height);
  } else if (msg.type === 'REPLACE_IMAGE') {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length > 0) {
      const node = selectedNodes[0];
      if ('fills' in node) {
        const fills = node.fills as ReadonlyArray<Paint>; // Type assertion to ensure 'fills' is treated as an array of Paint
        const imageFill = fills.find((fill) => fill.type === 'IMAGE');
        if (imageFill) {
          const newPaint = {
            type: imageFill.type,
            visible: imageFill.visible,
            opacity: imageFill.opacity,
            blendMode: imageFill.blendMode,
            imageHash: figma.createImage(new Uint8Array(msg.data)).hash, // Ensure msg.data is converted to Uint8Array
            scaleMode: imageFill.scaleMode,
            scalingFactor: imageFill.scalingFactor,
            rotation: imageFill.rotation,
            filters: imageFill.filters,
          };
          node.fills = [newPaint];
        }
      }
    }
  } else if (msg.type === 'FETCH_RAW_IMAGE') {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length > 0) {
      const node = selectedNodes[0];
      const imageNode = await getImageNode(node);
      if (imageNode) {
        figma.ui.postMessage({
          type: 'RAW_IMAGE_DATA',
          data: imageNode.imageData,
        });
      }
    }
  } else if (msg.type === 'SHOW_ERROR') {
    figma.notify(msg.message);
  }
};

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
