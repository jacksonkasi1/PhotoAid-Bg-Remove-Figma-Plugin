import React, { useState, useEffect } from 'react';

// ** import components
import { Button } from '@/components/ui/button';
import RenderImage from '@/components/render-image';
import { ThemeProvider } from '@/components/theme-provider';

// ** import utils
import { arrayBufferToBase64 } from '@/utils/file-utils';
import { uploadImageForBackgroundRemoval, getBackgroundRemovalResult } from '@/utils/background-removal';

function Page() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [rawImageData, setRawImageData] = useState<ArrayBuffer | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    window.onmessage = async (event) => {
      if (event.data.pluginMessage.type === 'FETCH_IMAGE_NODE') {
        const base64String = await arrayBufferToBase64(event.data.pluginMessage.data.imageData);
        setImageData(base64String);
        setSelectedNodeId(event.data.pluginMessage.data.id);
      } else if (event.data.pluginMessage.type === 'RAW_IMAGE_DATA') {
        setRawImageData(event.data.pluginMessage.data);
      }
    };
  }, []);

  const handleRemoveBackground = async () => {
    try {
      setLoading(true);
      if (rawImageData && selectedNodeId) {
        const base64String = await arrayBufferToBase64(new Uint8Array(rawImageData));
        const requestId = await uploadImageForBackgroundRemoval(base64String);

        if (requestId) {
          const resultBase64 = await getBackgroundRemovalResult(requestId);
          if (resultBase64) {
            setImageData(`data:image/png;base64,${resultBase64}`);
            const resultBlob = await fetch(`data:image/png;base64,${resultBase64}`).then(res => res.blob());
            window.parent.postMessage({ pluginMessage: { type: 'REPLACE_IMAGE', data: await resultBlob.arrayBuffer(), nodeId: selectedNodeId } }, '*');
          } else {
            console.error('Failed to retrieve background removal result');
            window.parent.postMessage({ pluginMessage: { type: 'SHOW_ERROR', message: 'Failed to retrieve background removal result' } }, '*');
          }
        } else {
          console.error('Failed to upload image for background removal');
          window.parent.postMessage({ pluginMessage: { type: 'SHOW_ERROR', message: 'Failed to upload image for background removal' } }, '*');
        }
      }
    } catch (error) {
      console.error('Failed to remove background', error);
      window.parent.postMessage({ pluginMessage: { type: 'SHOW_ERROR', message: 'Failed to remove background' } }, '*');
    } finally {
      setLoading(false);
    }
  };

  const fetchRawImage = () => {
    window.parent.postMessage({ pluginMessage: { type: 'FETCH_RAW_IMAGE' } }, '*');
  };

  useEffect(() => {
    fetchRawImage();
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col h-screen gap-1 p-2 mx-auto">
        <RenderImage imageData={imageData} />
        <Button onClick={handleRemoveBackground} disabled={loading}>
          {loading ? 'Processing...' : 'Replace Background'}
        </Button>
      </div>
    </ThemeProvider>
  );
}

export default Page;
