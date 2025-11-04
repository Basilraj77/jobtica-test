import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Icon from '../Icon.tsx';

interface WYSIWYGEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({ value, onChange, placeholder, readOnly = false }) => {
    const quillRef = useRef<ReactQuill>(null);

    // Custom toolbar with comprehensive formatting options
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: function() {
                    const editor = quillRef.current?.getEditor();
                    if (!editor) return;

                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const range = editor.getSelection(true);
                                editor.insertEmbed(range.index, 'image', e.target?.result);
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                }
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'check', 'indent',
        'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    return (
        <div className="wysiwyg-editor-container">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Start writing your content...'}
                readOnly={readOnly}
                className="bg-white"
            />
            <style>{`
                .wysiwyg-editor-container .ql-container {
                    min-height: 300px;
                    font-size: 16px;
                    font-family: inherit;
                }
                .wysiwyg-editor-container .ql-editor {
                    min-height: 300px;
                }
                .wysiwyg-editor-container .ql-toolbar {
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem 0.375rem 0 0;
                }
                .wysiwyg-editor-container .ql-container {
                    border: 1px solid #d1d5db;
                    border-top: none;
                    border-radius: 0 0 0.375rem 0.375rem;
                }
                .wysiwyg-editor-container .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default WYSIWYGEditor;
