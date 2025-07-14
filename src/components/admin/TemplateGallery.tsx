import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, ArrowLeft, Copy, Trash2, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { invitationTemplates } from '../../data/templates';

const [templates, setTemplates] = useState<TemplateInfo[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [loading, setLoading] = useState(true);
const [copiedId, setCopiedId] = useState<string | null>(null);

useEffect(() => {
    loadTemplates();
}, []);

const [templates, setTemplates] = useState<TemplateInfo[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [loading, setLoading] = useState(true);
const [copiedId, setCopiedId] = useState<string | null>(null);

useEffect(() => {
    loadTemplates();
}, []);

<div className="flex items-center gap-2">
    <span className="text-xs text-gray-400">{template.id}</span>
    <div className="flex gap-1">
        <button
            onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(template.id);
                setCopiedId(template.id);
                setTimeout(() => setCopiedId(null), 2000);
            }}
            className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
            title="Copy template ID"
        >
            {copiedId === template.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
        <button
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
        </button>
    </div>
</div>