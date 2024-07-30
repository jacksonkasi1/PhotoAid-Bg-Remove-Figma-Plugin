// fetchImagesHandlers.ts

import { NodeData, NodeType } from '@/types/node';

const exportSize = (type: 'SCALE' | 'HEIGHT', value: number): ExportSettings => ({
  format: 'JPG',
  constraint: { type, value },
});

export async function getImageNode(node: SceneNode): Promise<NodeData | null> {
  const typesWithFills = [
    'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'SHAPE_WITH_TEXT',
  ];
  if (typesWithFills.includes(node.type) && 'fills' in node && Array.isArray(node.fills)) {
    const fills = node.fills as ReadonlyArray<Paint>;
    const imageFill = fills.find((fill) => fill.type === 'IMAGE');
    if (imageFill) {
      const imageUrl = await node.exportAsync(exportSize('HEIGHT', 150));
      return { id: node.id, name: node.name, type: 'IMAGE' as NodeType, imageData: imageUrl };
    }
  }
  if ('children' in node) {
    for (const child of node.children) {
      const result = await getImageNode(child);
      if (result) return result;
    }
  }
  return null;
}
