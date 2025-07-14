import React, { useState, useRef } from 'react';
import { Upload, Wand2, Crop } from 'lucide-react';
import { CustomizationOptions } from '../../types/customization';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface MediaUploaderProps {
  options: CustomizationOptions;
  onOptionsChange: (options: CustomizationOptions) => void;
  imagePrompt: string;
  onImagePromptChange: (prompt: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  options,
  onOptionsChange,
  imagePrompt,
  onImagePromptChange,
  onUpload,
  onGenerate,
  isGenerating,
  error
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleCrop = () => {
    if (cropperRef.current?.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL();
      setCropData(croppedImage);
      onOptionsChange({
        ...options,
        heroImage: {
          type: 'upload',
          url: croppedImage
        }
      });
      setShowCropper(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropData(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl w-full space-y-6">
      <h3 className="text-2xl font-semibold text-white mb-6">Media Upload</h3>
      
      {showCropper && cropData ? (
        <div className="space-y-4">
          <Cropper
            ref={cropperRef}
            src={cropData}
            style={{ height: 400, width: '100%' }}
            aspectRatio={16 / 9}
            guides={true}
            preview=".preview"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowCropper(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
            >
              <Crop size={20} />
              Apply Crop
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="shimmer-wrapper">
            <div className="shimmer"></div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors relative z-10"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300">Click or drag image to upload</p>
                  <p className="text-gray-500 text-sm mt-1">Supports: JPG, PNG, WebP</p>
                </div>
              </label>
            </div>
          </div>

          <div className="text-center text-gray-400">- OR -</div>

          <div className="space-y-4">
            <div className="shimmer-wrapper">
              <div className="shimmer"></div>
              <textarea
                value={imagePrompt}
                onChange={(e) => onImagePromptChange(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 relative z-10 h-32"
              />
            </div>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !imagePrompt}
              className="w-full flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>
      )}

      {options.heroImage && !showCropper && (
        <div className="mt-4">
          <h4 className="text-white mb-2">Preview</h4>
          <img
            src={options.heroImage.url}
            alt="Hero preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}
    </div>
  );
};

export default MediaUploader;