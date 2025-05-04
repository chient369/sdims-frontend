import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/Button';
import { Modal } from '../modals/Modal';
import { ModalHeader } from '../modals/ModalHeader';
import { ModalBody } from '../modals/ModalBody';
import { ModalFooter } from '../modals/ModalFooter';

/**
 * ImageCropper component for cropping images
 * @param {string} src - Source URL of the image to crop
 * @param {boolean} isOpen - Whether the cropper modal is open
 * @param {Function} onClose - Callback when the modal is closed
 * @param {Function} onCropComplete - Callback when cropping is completed with the cropped image blob
 * @param {number} aspectRatio - Optional aspect ratio to enforce for the crop
 * @param {number} minWidth - Minimum width for the crop in pixels
 * @param {number} minHeight - Minimum height for the crop in pixels
 * @returns {JSX.Element} The rendered image cropper component
 */
interface ImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio,
  minWidth = 100,
  minHeight = 100,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: aspectRatio ? 50 / aspectRatio : 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    const pixelRatio = window.devicePixelRatio;
    
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  };
  
  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>Crop Image</ModalHeader>
      <ModalBody>
        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={handleCropComplete}
            aspect={aspectRatio}
            minWidth={minWidth}
            minHeight={minHeight}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop"
              className="max-h-96 object-contain"
            />
          </ReactCrop>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={getCroppedImg}>
          Apply Crop
        </Button>
      </ModalFooter>
    </Modal>
  );
}; 