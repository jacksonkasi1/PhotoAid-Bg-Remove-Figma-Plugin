import React from 'react';

const RenderImage = ({ imageData }) => {
  return (
    <div className="flex justify-center w-full h-full ">
      {imageData ? (
        <img src={imageData} alt="Selected" className="object-contain" />
      ) : (
        <p className="text-primary">No image selected</p>
      )}
    </div>
  );
};

export default RenderImage;
