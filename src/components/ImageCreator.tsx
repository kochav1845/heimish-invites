import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Wand2, Download, Loader2, Image, RefreshCw, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ImageCreatorProps {
  type: 'text-to-image' | 'image-to-image';
  onBack: () => void;
  onImageSaved?: (url: string, generationId: string) => void;
}

const ImageCreator: React.FC<ImageCreatorProps> = ({ type, onBack, onImageSaved }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [model, setModel] = useState<string>('photon-1');
  const [imageWeight, setImageWeight] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultGenerationId, setResultGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    try {
      setUploadProgress(10);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      setUploadProgress(30);

      setUploadProgress(50);

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      setUploadProgress(90);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const saveImageToStorage = async (imageUrl: string): Promise<string> => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Fetch the image from the provided URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Get the image as a blob
      const imageBlob = await response.blob();
      
      // Generate a unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `ai-generated/${fileName}`;
      
      // Upload to Supabase storage - make sure to use the correct bucket name
      const { data, error: uploadError } = await supabase.storage
        .from('stardev')
        .upload(filePath, imageBlob, {
          cacheControl: '3600',
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      // Store record in images table
      const { data: imageRecord, error: dbError } = await supabase
        .from('images')
        .insert([
          { 
            url: publicUrl, 
            type: 'ai', 
            prompt: prompt 
          }
        ])
        .select();

      if (dbError) {
        console.error("Error recording image in database:", dbError);
        // Continue anyway as we have the URL
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Error saving image to storage:', error);
      setError(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return imageUrl; // Fall back to original URL
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      if (type === 'image-to-image' && !file) {
        throw new Error('Please select an image file');
      }
      
      if (!prompt) {
        throw new Error('Please enter a prompt');
      }

      // Prepare request data based on generation type
      let requestData: any = {
        prompt,
        aspectRatio,
        model,
      };

      // Add type-specific data
      if (type === 'image-to-image' && file) {
        const imageUrl = await uploadFile();
        if (!imageUrl) {
          throw new Error('Failed to upload file');
        }
        requestData.imageUrl = imageUrl;
        requestData.imageWeight = imageWeight;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-luma-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate image';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          if (response.status === 504 || response.status === 408) {
            errorMessage = 'Image generation is taking longer than expected. Please try again in a few moments.';
          } else if (response.status === 500) {
            errorMessage = 'Server error occurred during image generation. Please try again.';
          } else {
            errorMessage = `Request failed with status ${response.status}. Please try again.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.success) {
        // Set the result temporarily to the API-provided URL
        setResult(data.url);
        setResultGenerationId(data.generationId);

        // Save the image to our storage
        console.log('Saving image to storage:', data.url);
        const savedUrl = await saveImageToStorage(data.url);
        
        // Update UI with saved URL
        setResult(savedUrl);
        
        // Notify parent component
        if (onImageSaved) {
          onImageSaved(savedUrl, data.generationId || '');
        }
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to the image generation service. Please check your connection and try again.');
      } else {
        setError(error instanceof Error ? error.message : 'An unknown error occurred. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download image');
    }
  };

  const getTypeIcon = () => {
    if (type === 'image-to-image') return <Image size={24} className="text-purple-400" />;
    return <Wand2 size={24} className="text-purple-400" />;
  };

  const getTypeTitle = () => {
    if (type === 'image-to-image') return 'Image to Image';
    return 'Text to Image';
  };

  return (
    <div className="min-h-screen bg-black/90 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Options
        </button>

        <div className="flex items-center gap-3 mb-8">
          {getTypeIcon()}
          <h2 className="text-3xl font-michroma text-white">
            {getTypeTitle()}
          </h2>
        </div>

        <div className="space-y-6">
          {type === 'image-to-image' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Reference Image
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-purple-500 transition-colors flex flex-col items-center justify-center gap-4"
                >
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-gray-400">
                    Click to upload an image
                  </span>
                  {file && (
                    <span className="text-purple-400">{file.name}</span>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, WebP (max 10MB)
              </div>
              
              {type === 'image-to-image' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Image Influence: {Math.round(imageWeight * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={imageWeight}
                    onChange={(e) => setImageWeight(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>More Creative</span>
                    <span>More Similar</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 h-32" 
              placeholder="Describe the image you want to create..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="3:4">3:4 (Portrait)</option>
                <option value="4:3">4:3 (Landscape)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="photon-1">photon-1 (High Quality)</option>
                <option value="photon-flash-1">photon-flash-1 (Faster)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt || (type === 'image-to-image' && !file))}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {uploadProgress > 0 && uploadProgress < 100 
                    ? `Uploading (${uploadProgress}%)` 
                    : 'Generating...'}
                </>
              ) : ( 
                <>
                  <Wand2 size={20} />
                  Generate
                </>
              )}
            </button>

            {result && (
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 p-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                <Download size={20} />
                Download
              </button>
            )}
          </div>

          {isGenerating && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/50 text-red-400 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-xl font-michroma text-white">Result</h3>
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={result}
                  alt="Generated image"
                  className="w-full object-contain"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Reset everything except the result and generation ID
                    setPrompt('');
                    setFile(null);
                    // Keep the result for comparison
                  }}
                  className="flex items-center justify-center gap-2 p-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw size={20} />
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCreator;