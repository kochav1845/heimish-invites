@@ .. @@
 import React, { useState, useEffect } from 'react';
-import { Type, Copy, Check } from 'lucide-react';
+import { Type, Copy, Check, Eye, EyeOff } from 'lucide-react';
 
 interface DatabasePlaceholder {
@@ .. @@
   value: string;
   isSelected: boolean;
   onValueChange: (value: string) => void;
+  onCopy?: (value: string) => void;
   onSelect: () => void;
 }
 
@@ .. @@
   value,
   isSelected,
   onValueChange,
+  onCopy,
   onSelect
 }) => {
   const [localValue, setLocalValue] = useState(value);
@@ .. @@
     setHasLocalChanges(false);
   };
 
+  const handleCopy = () => {
+    if (onCopy) {
+      onCopy(localValue);
+    } else {
+      navigator.clipboard.writeText(localValue);
+    }
+    setIsCopied(true);
+    setTimeout(() => setIsCopied(false), 2000);
+  };
+
   return (
     <div
       className={`border rounded-lg transition-all duration-200 ${
@@ .. @@
           <div className="flex items-center gap-2">
             <div className="text-xs text-gray-400">
               {placeholder.field_type} • {placeholder.style.fontSize}px
-            </div>
+            </div>
+            <button
+              onClick={(e) => {
+                e.stopPropagation();
+                handleCopy();
+              }}
+              className="p-1 text-gray-400 hover:text-white transition-colors"
+              title="Copy text"
+            >
+              {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
+            </button>
           </div>
         </div>
  )
}