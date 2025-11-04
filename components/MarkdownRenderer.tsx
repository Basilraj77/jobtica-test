import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const toHtml = (text: string) => {
        if (!text) return '';

        // Inline replacements first
        let html = text
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Process block-level elements by splitting into paragraphs
        const blocks = html.split(/\n{2,}/);

        const processedBlocks = blocks.map(block => {
            const trimmedBlock = block.trim();

            // Tables (must be checked before lists/paragraphs)
            if (trimmedBlock.startsWith('|') && trimmedBlock.includes('---')) {
                const rows = trimmedBlock.split('\n');
                const headerRow = rows.shift();
                const separatorRow = rows.shift();
                if (!headerRow || !separatorRow) return `<p>${trimmedBlock.replace(/\n/g, ' ')}</p>`;

                let tableHtml = '<table><thead><tr>';
                headerRow.split('|').slice(1, -1).forEach(cell => {
                    tableHtml += `<th>${cell.trim()}</th>`;
                });
                tableHtml += '</tr></thead><tbody>';

                rows.forEach(row => {
                    tableHtml += '<tr>';
                    row.split('|').slice(1, -1).forEach(cell => {
                        tableHtml += `<td>${cell.trim()}</td>`;
                    });
                    tableHtml += '</tr>';
                });

                tableHtml += '</tbody></table>';
                return tableHtml;
            }

            // Unordered Lists
            if (trimmedBlock.match(/^(?:[-*] .*(?:\n|$))+/)) {
                const items = trimmedBlock.split('\n').map(item => `<li>${item.replace(/^\s*[-*]\s*/, '')}</li>`).join('');
                return `<ul>${items}</ul>`;
            }
            
            // Ordered Lists
            if (trimmedBlock.match(/^(?:\d+\. .*(?:\n|$))+/)) {
                 const items = trimmedBlock.split('\n').map(item => `<li>${item.replace(/^\s*\d+\.\s*/, '')}</li>`).join('');
                return `<ol>${items}</ol>`;
            }
            
            // Paragraphs (default case)
            if (trimmedBlock === '') return '';
            // For paragraphs, treat single newlines as spaces for proper text flow.
            return `<p>${trimmedBlock.replace(/\n/g, ' ')}</p>`;
        });

        return processedBlocks.join('');
    };

    return <div dangerouslySetInnerHTML={{ __html: toHtml(content) }} />;
};

export default MarkdownRenderer;
