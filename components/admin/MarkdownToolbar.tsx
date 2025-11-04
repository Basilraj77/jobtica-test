import React from 'react';
import Icon from '../Icon.tsx';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onValueChange: (value: string) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; icon: string; title: string }> = ({ onClick, icon, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="p-2 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
        <Icon name={icon} />
    </button>
);

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ textareaRef, onValueChange }) => {
    const applyFormat = (syntaxStart: string, syntaxEnd: string = syntaxStart) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        const newText = `${textarea.value.substring(0, start)}${syntaxStart}${selectedText}${syntaxEnd}${textarea.value.substring(end)}`;
        
        onValueChange(newText);
    };
    
    const applyList = (marker: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        const lines = selectedText.split('\n');
        const isNumbered = marker === '1.';
        const newList = lines.map((line, index) => `${isNumbered ? (index + 1) + '.' : '-'} ${line}`).join('\n');

        const newText = `${textarea.value.substring(0, start)}${newList}${textarea.value.substring(end)}`;
        onValueChange(newText);
    };

    const insertTable = () => {
        const tableTemplate = `\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |\n`;
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const newText = `${textarea.value.substring(0, start)}${tableTemplate}${textarea.value.substring(start)}`;
        onValueChange(newText);
    };

    const insertParagraphBreak = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const newText = `${textarea.value.substring(0, start)}\n\n${textarea.value.substring(start)}`;
        onValueChange(newText);
    };

    return (
        <div className="flex items-center gap-1 p-1 border border-b-0 bg-gray-100 rounded-t-md">
            <ToolbarButton onClick={() => applyFormat('**')} icon="bold" title="Bold" />
            <ToolbarButton onClick={() => applyFormat('*')} icon="italic" title="Italic" />
            <div className="h-5 w-px bg-gray-300 mx-1" />
            <ToolbarButton onClick={() => applyList('-')} icon="list-ul" title="Bulleted List" />
            <ToolbarButton onClick={() => applyList('1.')} icon="list-ol" title="Numbered List" />
            <div className="h-5 w-px bg-gray-300 mx-1" />
            <ToolbarButton onClick={insertTable} icon="table" title="Insert Table" />
            <ToolbarButton onClick={insertParagraphBreak} icon="paragraph" title="New Paragraph" />
        </div>
    );
};

export default MarkdownToolbar;