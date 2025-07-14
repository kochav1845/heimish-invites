import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Wand2, Download, Loader2, Video, Image, RefreshCw, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useEffect,  } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface VideoCreatorProps {
  type: 'image-to-video' | 'extend-video' | 'modify-video';
  generationId?: string;
  onVideoSaved?: (url: string, generationId: string) => void;
  onBack: () => void;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({ type, generationId, onVideoSaved, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultGenerationId, setResultGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [loop, setLoop] = useState<boolean>(false);
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

      try {
        // Determine the correct bucket based on file type
        const isImageFile = file.type.startsWith('image/');
        const bucketName = isImageFile ? 'images' : 'videos';

        console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`);
        
        // Upload file to Supabase storage
        const { data, error } = await supabase.storage
          .from(bucketName)
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
          .from(bucketName)
          .getPublicUrl(data.path);

        setUploadProgress(100);
        return publicUrl;
      } catch (uploadError) {
        console.error('Upload to Supabase failed:', uploadError);
        setError(`Upload failed: ${uploadError.message || 'Storage error'}`);
        setIsGenerating(false);
        setUploadProgress(0);
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Instead of throwing, return null and handle the error in the calling function
      return null;
    }
  };

  // Function to save a video from URL to Supabase storage
  const saveVideoToStorage = async (videoUrl: string) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Fetch the video
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      // Get the video as a blob
      const videoBlob = await response.blob();
      
      // Generate a unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.mp4`;
      const filePath = `saved/${fileName}`;
      
      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('videos') // Make sure this bucket exists
        .upload(filePath, videoBlob, {
          cacheControl: '3600',
          contentType: 'video/mp4',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);
      
      // Update the result URL to point to our storage
      setResult(publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Error saving video to storage:', error);
      setError(`Failed to save video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setResultGenerationId(null); // Reset previous generation ID
      setError(null);

      if (type === 'image-to-video' && !file) {
        throw new Error('Please select an image file');
      }

      if (!prompt) {
        throw new Error('Please enter a prompt');
      }
      
      // Show processing message
      setIsGenerating(true);
      setError(null);

      // Prepare request data based on generation type
      let requestData: any = {
        prompt: prompt.trim(),
        aspectRatio,
        loop
      };

      // Add type-specific data
      if (type === 'image-to-video' && file) {
        const imageUrl = await uploadFile();
        
        // Check if upload was successful
        if (!imageUrl) return;
        
        requestData.imageUrl = imageUrl;
      } else if (type === 'extend-video') {
        requestData.generationId = generationId || resultGenerationId;
      }

      try {
        console.log('Sending video generation request with data:', {
          type: type,
          prompt: prompt.substring(0, 30) + '...',
          hasImage: !!requestData.imageUrl
        });

        // Use generate-luma-video endpoint for all video generation
        const endpoint = 'generate-luma-video';

        // Add a timestamp to prevent caching
        const timestamp = Date.now();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90-second timeout
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}?t=${timestamp}&direct=true`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Client-Info': 'videoCreator',
          }, 
          body: JSON.stringify({
            prompt,
            imageUrl: type === 'image-to-video' ? requestData.imageUrl : undefined,
            videoUrl: type === 'modify-video' || type === 'extend-video' ? requestData.imageUrl : undefined,
            generationType: type, // This was the undefined variable
            aspectRatio,
            loop
          }), 
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);

        if (!response.ok) {
          let errorMessage = 'Failed to generate video';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If we can't parse the response, it might be a timeout or network error
            if (response.status === 504 || response.status === 408) {
              errorMessage = 'Video generation is taking longer than expected (10+ min). Please try again in a few moments.';
            } else if (response.status === 500) {
              errorMessage = 'Server error occurred during video generation. Please try again.';
            } else {
              errorMessage = `Request failed with status ${response.status}. Please try again.`;
            }
          }
          
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
          console.log('Response data:', data);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          throw new Error('Invalid response from server. Please try again.');
        }
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.success) {
          // Check if URL is provided (generation completed)
          if (data.url) {
            // Set the result temporarily to the API-provided URL
            setResult(data.url);
            setResultGenerationId(data.generationId);

            // If the URL is already from our storage, no need to save again
            if (data.url.includes(import.meta.env.VITE_SUPABASE_URL)) {
              console.log('Video already in our storage:', data.url);
              if (onVideoSaved) {
                onVideoSaved(data.url, data.generationId);
              }
            } else {
              // Save the video to our storage
              console.log('Saving video to storage:', data.url);
              const savedUrl = await saveVideoToStorage(data.url);
              if (savedUrl && onVideoSaved) {
                onVideoSaved(savedUrl, data.generationId);
              }
            }
          } else {
            // Handle case where success is true but no URL is provided yet
            // This might happen when the generation is successful but still processing
            setResultGenerationId(data.generationId);
            if (data.generationId) {
              setError(`Video generation started successfully. This typically takes 5-10 minutes. Generation ID: ${data.generationId}`);
              startStatusPolling(data.generationId);
              if (onVideoSaved) {
                onVideoSaved(null, data.generationId);
              }
            }
          }
        } else if (data.inProgress) {
          // If the generation is still in progress, show message but don't throw error
          setError(`The video is now being generated. This typically takes 5-10 minutes. We'll automatically check the status. Generation ID: ${data.generationId}`);
          setResultGenerationId(data.generationId);
          
          // Start polling for status
          startStatusPolling(data.generationId);
          
          if (onVideoSaved) {
            onVideoSaved(null, data.generationId);
          }
        } else if (data.generationId) {
          // If we just got a generation ID without completion, start polling
          setError(`Video generation started successfully. This typically takes 5-10 minutes. Generation ID: ${data.generationId}`);
          setResultGenerationId(data.generationId);
          
          // Start polling for status
          startStatusPolling(data.generationId);
          
          if (onVideoSaved) {
            onVideoSaved(null, data.generationId);
          }
        } else {
          throw new Error(data.error || 'Failed to generate video');
        }
      } catch (error) {
        console.error('Video generation error:', error);
        
        if (error instanceof TypeError && error.message?.includes('fetch')) {
          setError('Network error: Unable to connect to the video generation service. Please check your connection and try again.');
        } else {
          setError(error instanceof Error ? error.message : 'An unknown error occurred. Please try again.');
        }
      } finally {
        setIsGenerating(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      if (error instanceof TypeError && error.message?.includes('fetch')) {
        setError('Network error: Unable to connect to the video generation service. Please check your connection and try again.');
      } else if (error.message?.includes('Failed to upload file')) {
        setError('Upload error: Unable to upload your file. Please check your internet connection and try again with a smaller file.');
      } else {
        setError(error instanceof Error ? error.message : 'An unknown error occurred. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      setUploadProgress(0);
    }
  };

  // Function to poll for video generation status
  const startStatusPolling = async (genId: string) => {
    if (!genId) return;
    
    let attempts = 0;
    const maxAttempts = 20; // Will check status for ~10 minutes (30s × 20)
    const pollInterval = 30000; // 30 seconds between initial checks
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError(`Generation is taking longer than expected (10+ minutes). You can check later using ID: ${genId}`);
        return;
      }
      
      try {
        setError(`Checking video status (attempt ${attempts + 1}/${maxAttempts})... Generation ID: ${genId}`);
        attempts++;
        
        // Use a random query param to avoid caching
        const nocache = Date.now();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-luma-status?generationId=${genId}&nocache=${nocache}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'X-Client-Info': 'statusCheck',
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'completed' && data.url) {
            // Success! Video is ready
            setResult(data.url);
            setResultGenerationId(genId);
            setError(null);
            
            // Save the video to our storage
            console.log('Saving completed video to storage:', data.url);
            const savedUrl = await saveVideoToStorage(data.url);
            if (savedUrl && onVideoSaved) {
              onVideoSaved(savedUrl, genId);
            }
            
            return; // No need to keep polling
          } else if (data.status === 'failed') {
            setError(`Generation failed: ${data.reason || 'Unknown error'}`);
            return;
          } else if (data.status === 'processing') {
            // Still processing, keep polling with adaptive interval
            // Increase polling interval as attempts increase for better performance
            const adaptiveInterval = Math.min(pollInterval + (attempts * 5000), 60000); // Max 60 seconds
            setTimeout(checkStatus, adaptiveInterval);
          }
        } else {
          console.error('Status check failed:', response.status, response.statusText);
          setTimeout(checkStatus, pollInterval + 5000); // Add delay after error
        }
      } catch (error) {
        console.error('Error checking status:', error);
        // Continue polling despite error with a longer delay
        setTimeout(checkStatus, pollInterval + 10000);
      }
    };
    
    // Start first check sooner
    setTimeout(checkStatus, 10000); // First check after 10 seconds
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download video');
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'image-to-video':
        return <Image size={24} className="text-purple-400" />;
      case 'extend-video':
        return <RefreshCw size={24} className="text-purple-400" />;
      case 'modify-video':
        return <Video size={24} className="text-purple-400" />;
      default:
        return <Wand2 size={24} className="text-purple-400" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'image-to-video':
        return 'Image to Video';
      case 'extend-video':
        return 'Extend Video';
      case 'modify-video':
        return 'Text to Video';
      default:
        return 'Video Creation';
    }
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
          {type === 'image-to-video' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Image
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
                  <Upload size={32} className={isGenerating ? "text-gray-500" : "text-gray-400"} />
                  <span className="text-gray-400">
                    Click to upload an image
                  </span>
                  {file && (
                    <span className="text-purple-400">{file.name}</span>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-gray-400">
                  {type === 'image-to-video' 
                    ? `Uploading (${uploadProgress}%)` 
                    : resultGenerationId 
                      ? 'Processing... (5-10 minutes)'
                      : 'Starting generation...'}
                </span>
                {isGenerating && (
                  <span className="text-yellow-400 text-xs block mt-2">
                    Processing can take 5-10 minutes. Please be patient.
                  </span>
                )}
              </div>
            </div>
          )}

          {type === 'extend-video' && (
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-white text-lg mb-4 flex items-center gap-2">
                <RefreshCw size={18} className="text-purple-400" />
                Extend Video {generationId || resultGenerationId ? 'ID: ' + (generationId || resultGenerationId) : ''}
              </h3>
              <p className="text-gray-400 mb-4">
                {generationId || resultGenerationId 
                  ? 'The video will be extended based on the selected generation.' 
                  : 'To extend a video, you need to first generate a video or provide a generation ID.'}
              </p>
              {(generationId || resultGenerationId) && (
                <div className="bg-purple-900/30 p-3 rounded border border-purple-500/30 text-purple-300 text-sm font-mono">
                  Generation ID: {generationId || resultGenerationId}
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
              disabled={isGenerating}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 h-32" 
              placeholder="Describe how you want to transform the media..."
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
                disabled={isGenerating}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Classic)</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  disabled={isGenerating}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span>Loop Video</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt || (type === 'image-to-video' && !file))}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Uploading (${uploadProgress}%)` 
                      : 'Generating... (5-10 minutes)'}
                  </span>
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
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/50 rounded-lg border border-red-800">
              <h4 className="text-red-300 font-medium mb-1">Generation Status:</h4>
              <p className="text-red-400">{error}</p>
              <div className="mt-2 pt-2 border-t border-red-800/50">
                {resultGenerationId && (
                  <div className="flex flex-col">
                    <div className="flex flex-wrap justify-between items-center">
                      <p className="text-xs text-red-300">Generation ID:</p>
                      <button 
                        className="text-xs text-blue-300 hover:text-blue-200"
                        onClick={() => {
                          navigator.clipboard.writeText(resultGenerationId);
                          // Show copy confirmation
                          const originalText = event.currentTarget.textContent;
                          event.currentTarget.textContent = 'Copied!';
                          setTimeout(() => {
                            event.currentTarget.textContent = originalText;
                          }, 2000);
                        }}
                      >
                        Copy ID
                      </button>
                    </div>
                    <code className="bg-black/30 p-1 rounded text-xs font-mono text-gray-300 mt-1 break-all">
                      {resultGenerationId}
                    </code>
                    <p className="mt-2 text-xs text-red-300">
                      Video generation usually takes 5-10 minutes. Status checks run automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-xl font-michroma text-white">Result</h3>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={result} 
                  key={result} // Force reload when URL changes
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                  loop={loop}
                />
              </div>
              
              {resultGenerationId && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-300 text-sm">Generation ID (for extending):</p>
                    {isSaving && (
                      <div className="flex items-center gap-2 text-yellow-400 text-xs">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Saving to storage...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-900 p-2 rounded font-mono text-xs text-gray-300 break-all">
                      {resultGenerationId}
                    </div>
                    <button
                      onClick={() => saveVideoToStorage(result!)}
                      disabled={isSaving}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save to storage"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span className="hidden sm:inline">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span className="hidden sm:inline">Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Reset everything except the generation ID
                    setPrompt('');
                    setFile(null);
                    setResult(null);
                    // Keep the generation ID for extending if needed
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

export default VideoCreator;