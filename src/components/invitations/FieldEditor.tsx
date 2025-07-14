import React, { useState, useEffect, useRef } from 'react';


interface FieldEditorProps {
  placeholder: any;
  value: string;
  isSelected: boolean;
  onValueChange: (value: string) => void;
  onCopy?: (value: string) => void;
  onSelect: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  placeholder,
  value,
  isSelected,
  onValueChange,
  onCopy,
  onSelect
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
    setHasLocalChanges(false);
  }, [value]);
  
  // Focus the input when selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      // Don't focus on mobile devices to avoid keyboard popping up
      if (window.innerWidth > 768) { 
        inputRef.current.focus();
        
        // Select all text when focused
        if (inputRef.current.tagName.toLowerCase() === 'input') {
          (inputRef.current as HTMLInputElement).select();
        }
      }
    }
  }, [isSelected]);

  const handleLocalChange = (newValue: string) => {
    setLocalValue(newValue);
    setHasLocalChanges(true);

    // Immediately update parent with the new value
    onValueChange(newValue);
    setHasLocalChanges(false);
  };

  // Handle blur event
  const handleBlur = () => {
    // Immediately save on blur
    if (hasLocalChanges) {
      onValueChange(localValue);
      setHasLocalChanges(false);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(localValue);
    } else {
      navigator.clipboard.writeText(localValue);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save immediately on Enter key
    if (e.key === 'Enter' && hasLocalChanges) {
      onValueChange(localValue);
      setHasLocalChanges(false);
    }
  };

  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        isSelected 
          ? ''
          : hasLocalChanges ? 'border-yellow-500 bg-yellow-500/10' 
          : 'border-gray-600 bg-gray-700/50' 
      }`}
    >
      <div className="p-3 cursor-pointer" onClick={onSelect}>
        <div className="flex items-center justify-between ">
          
         
         
        </div>

        {/* User Content Input - Only content editing, no styling changes */}
        {placeholder.field_type === 'textarea' ? (
          <div className="w-full">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={(e) => handleLocalChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder.placeholder}
              className={`w-full bg-gray-800 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none transition-colors`}
              rows={4}
              dir={placeholder.text_direction || (placeholder.label.includes('עברית') || /[\u0590-\u05FF]/.test(localValue) ? 'rtl' : 'ltr')}
            />
          </div>
        ) : (
          <div className="w-full">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={placeholder.field_type}
              value={localValue}
              onChange={(e) => handleLocalChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder.placeholder}
              className={`w-full bg-gray-800  : 'border-gray-600'} rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
              dir={placeholder.text_direction || 'rtl'}
              style={{
                textAlign: placeholder.style?.textAlign || 'center'
              }}
            />
          </div>
        )}
        
        {placeholder.description && (
          <div className="mt-2 text-xs text-gray-400">
            <span className="opacity-70">{placeholder.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldEditor;