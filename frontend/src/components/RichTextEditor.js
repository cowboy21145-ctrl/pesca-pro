import React, { useRef, useState } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
} from '@heroicons/react/24/outline';

const RichTextEditor = ({ value, onChange, placeholder = "Enter description..." }) => {
  const textareaRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText;
    if (selectedText) {
      newText = beforeText + before + selectedText + after + afterText;
    } else {
      newText = beforeText + before + after + afterText;
    }

    onChange({ target: { value: newText } });

    // Restore cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + (selectedText ? selectedText.length : 0) + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    
    if (line.trim().startsWith('- ')) {
      // Remove bullet
      const newValue = value.substring(0, lineStart) + line.replace(/^-\s+/, '') + value.substring(lineStart + line.length);
      onChange({ target: { value: newValue } });
    } else {
      // Add bullet
      const newValue = value.substring(0, lineStart) + '- ' + line + value.substring(lineStart + line.length);
      onChange({ target: { value: newValue } });
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
        textarea.focus();
      }, 0);
    }
  };

  const formatNumbered = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    
    if (/^\d+\.\s+/.test(line.trim())) {
      // Remove numbering
      const newValue = value.substring(0, lineStart) + line.replace(/^\d+\.\s+/, '') + value.substring(lineStart + line.length);
      onChange({ target: { value: newValue } });
    } else {
      // Add numbering
      const newValue = value.substring(0, lineStart) + '1. ' + line + value.substring(lineStart + line.length);
      onChange({ target: { value: newValue } });
      setTimeout(() => {
        textarea.setSelectionRange(start + 3, start + 3);
        textarea.focus();
      }, 0);
    }
  };

  // Simple markdown to HTML converter
  const formatDescription = (text) => {
    if (!text) return '';
    
    let html = text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bullet points
      .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
      // Numbered list
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1">$1</ul>');
    
    return html;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={formatBold}
          className="p-2 hover:bg-slate-200 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          title="Bold"
          aria-label="Bold"
        >
          <BoldIcon className="w-4 h-4 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={formatItalic}
          className="p-2 hover:bg-slate-200 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          title="Italic"
          aria-label="Italic"
        >
          <ItalicIcon className="w-4 h-4 text-slate-600" />
        </button>
        <div className="w-px h-6 bg-slate-300 hidden sm:block" />
        <button
          type="button"
          onClick={formatBullet}
          className="p-2 hover:bg-slate-200 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          title="Bullet List"
          aria-label="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={formatNumbered}
          className="p-2 hover:bg-slate-200 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          title="Numbered List"
          aria-label="Numbered List"
        >
          <NumberedListIcon className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 hidden md:block" />
        <p className="text-xs text-slate-500 hidden md:block">
          Use <strong>**bold**</strong>, <em>*italic*</em>, or <strong>-</strong> for lists
        </p>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        className="input-field min-h-[140px] md:min-h-[160px] text-sm md:text-base resize-y font-mono"
        placeholder={placeholder}
      />
    </div>
  );
};

// Export formatter function for use in display components
export const formatDescription = (text) => {
  if (!text) return '';
  
  let html = text
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  // Handle bullet points
  const lines = html.split('<br />');
  let result = [];
  let inList = false;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inList = true;
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        result.push('<ul class="list-decimal list-inside space-y-1 my-2">');
        inList = true;
      }
      result.push(`<li>${trimmed.replace(/^\d+\.\s+/, '')}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  });
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('<br />');
};

export default RichTextEditor;

