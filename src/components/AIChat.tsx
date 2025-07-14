import 'regenerator-runtime/runtime';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Camera, Volume2, Copy, Check, AlertCircle } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from 'react-use-clipboard';
import Webcam from 'react-webcam';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isCopied, setCopied] = useClipboard(selectedText, { successDuration: 2000 });
  const [ttsError, setTtsError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !imageData) return;

    const newMessage: Message = {
      role: 'user',
      content: imageData ? 'Analyzing image...' : input
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (imageData) {
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: imageData }),
        });
        setImageData(null);
      } else {
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            context: messages.map(m => ({ role: m.role, content: m.content }))
          }),
        });
      }

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.description
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const captureImage = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageData(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const speakText = async (text: string) => {
    setTtsError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setTtsError(error.message || 'Failed to generate speech. Please try again later.');
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setTtsError(null), 5000);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 mt-[10vh]">
      {ttsError && (
        <div className="bg-red-500/90 text-white p-3 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{ttsError}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-8 pt-[60px]" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-xl ${
                message.role === 'user'
                  ? 'bg-purple-600/80 text-white'
                  : 'bg-blue-600/80 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setSelectedText(message.content);
                    setCopied();
                  }}
                  className="text-white/80 hover:text-white"
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => speakText(message.content)}
                  className="text-white/80 hover:text-white"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-blue-600/80 text-white p-4 rounded-xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {showCamera && (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-64 object-cover"
          />
          <button
            onClick={captureImage}
            className="absolute bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full"
          >
            <Camera size={24} />
          </button>
        </div>
      )}

      {imageData && (
        <div className="relative">
          <img src={imageData} alt="Captured" className="w-full h-64 object-cover" />
          <button
            onClick={() => setImageData(null)}
            className="absolute top-2 right-2 bg-red-600/80 text-white p-2 rounded-full"
          >
            ×
          </button>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={1}
          />
          <div className="flex gap-2">
            {browserSupportsSpeechRecognition && (
              <button
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening();
                  } else {
                    resetTranscript();
                    SpeechRecognition.startListening();
                  }
                }}
                className={`p-3 rounded-lg ${
                  listening ? 'bg-red-600' : 'bg-purple-600'
                } text-white`}
              >
                <Mic size={24} />
              </button>
            )}
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="p-3 bg-purple-600 text-white rounded-lg"
            >
              <Camera size={24} />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !imageData)}
              className="p-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;