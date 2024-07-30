import React, { useState, useEffect } from 'react';

// ** import components
import { Button } from '@/components/ui/button';
import RenderImage from '@/components/render-image';
import { ThemeProvider } from '@/components/theme-provider';

// ** import utils
import { arrayBufferToBase64 } from '@/utils/file-utils';

function Page() {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    window.onmessage = async (event) => {
      if (event.data.pluginMessage.type === 'FETCH_IMAGE_NODE') {
        const base64String = await arrayBufferToBase64(event.data.pluginMessage.data.imageData);
        setImageData(base64String);
      }
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col h-screen gap-1 p-2 mx-auto">
        <RenderImage imageData={imageData} />
        <Button onClick={() => console.log('Replace background')}>Replace Background</Button>
      </div>
    </ThemeProvider>
  );
}

export default Page;
