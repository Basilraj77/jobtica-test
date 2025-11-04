import React, { useState, useEffect } from 'react';
import Icon from '../Icon.tsx';

interface ContentTemplate {
    id: string;
    name: string;
    category: string;
    icon: string;
    description: string;
    content: string;
    thumbnail?: string;
    isCustom?: boolean;
}

interface TemplateManagerProps {
    onSelectTemplate: (content: string) => void;
    onClose?: () => void;
}

const DEFAULT_TEMPLATES: ContentTemplate[] = [
    {
        id: 'blog-post',
        name: 'Blog Post',
        category: 'Content',
        icon: 'file-alt',
        description: 'Standard blog post structure with introduction, main content, and conclusion',
        content: `<h2>Introduction</h2>
<p>Start with an engaging introduction that hooks your readers and clearly states what they'll learn from this post.</p>

<h2>Main Content</h2>
<p>Present your main points with clear explanations, examples, and supporting evidence. Break complex topics into digestible sections.</p>

<h3>Key Point 1</h3>
<p>Detailed explanation of your first key point...</p>

<h3>Key Point 2</h3>
<p>Detailed explanation of your second key point...</p>

<h2>Conclusion</h2>
<p>Summarize the key takeaways and provide next steps or a call to action for your readers.</p>`
    },
    {
        id: 'announcement',
        name: 'Official Announcement',
        category: 'Announcements',
        icon: 'bullhorn',
        description: 'Formal announcement template for important updates',
        content: `<h1>Important Announcement</h1>
<p><strong>Date:</strong> [Insert Date]</p>
<p><strong>Subject:</strong> [Insert Subject]</p>

<h2>Details</h2>
<p>Provide the full details of your announcement here. Be clear and concise.</p>

<h2>Impact</h2>
<p>Explain how this announcement affects your audience.</p>

<h2>Action Required</h2>
<p>If applicable, list any steps that readers need to take:</p>
<ul>
<li>Step 1</li>
<li>Step 2</li>
<li>Step 3</li>
</ul>

<h2>Contact Information</h2>
<p>For questions or concerns, please contact: [Contact Details]</p>`
    },
    {
        id: 'job-listing',
        name: 'Job Listing',
        category: 'Jobs',
        icon: 'briefcase',
        description: 'Comprehensive job posting template',
        content: `<h1>[Job Title]</h1>

<h2>Organization Details</h2>
<p><strong>Organization:</strong> [Organization Name]</p>
<p><strong>Department:</strong> [Department Name]</p>
<p><strong>Location:</strong> [City, State]</p>

<h2>Position Overview</h2>
<p>Brief description of the role and its importance...</p>

<h2>Key Responsibilities</h2>
<ul>
<li>Responsibility 1</li>
<li>Responsibility 2</li>
<li>Responsibility 3</li>
</ul>

<h2>Qualifications & Requirements</h2>
<p><strong>Educational Qualification:</strong> [Details]</p>
<p><strong>Experience:</strong> [Details]</p>
<p><strong>Age Limit:</strong> [Details]</p>

<h2>Vacancy Details</h2>
<p><strong>Total Positions:</strong> [Number]</p>
<p><strong>Reservation Policy:</strong> As per government norms</p>

<h2>Salary & Benefits</h2>
<p><strong>Pay Scale:</strong> [Details]</p>
<p><strong>Allowances:</strong> [Details]</p>

<h2>How to Apply</h2>
<p>Detailed application process...</p>

<h2>Important Dates</h2>
<p><strong>Application Start Date:</strong> [Date]</p>
<p><strong>Last Date to Apply:</strong> [Date]</p>
<p><strong>Exam Date:</strong> [Date]</p>

<h2>Important Links</h2>
<p><a href="#">Official Notification</a></p>
<p><a href="#">Apply Online</a></p>`
    },
    {
        id: 'exam-notice',
        name: 'Exam Notification',
        category: 'Exams',
        icon: 'clipboard-list',
        description: 'Exam notification with all essential details',
        content: `<h1>Exam Notification: [Exam Name]</h1>

<h2>Exam Overview</h2>
<p><strong>Exam Name:</strong> [Full Exam Name]</p>
<p><strong>Conducting Body:</strong> [Organization Name]</p>
<p><strong>Notification Number:</strong> [Number]</p>

<h2>Important Dates</h2>
<table>
<tr><td><strong>Notification Release</strong></td><td>[Date]</td></tr>
<tr><td><strong>Application Start Date</strong></td><td>[Date]</td></tr>
<tr><td><strong>Last Date to Apply</strong></td><td>[Date]</td></tr>
<tr><td><strong>Exam Date</strong></td><td>[Date]</td></tr>
<tr><td><strong>Admit Card Release</strong></td><td>[Date]</td></tr>
<tr><td><strong>Result Declaration</strong></td><td>[Date]</td></tr>
</table>

<h2>Eligibility Criteria</h2>
<h3>Educational Qualification</h3>
<p>[Details about required qualifications]</p>

<h3>Age Limit</h3>
<p><strong>Minimum Age:</strong> [Years]</p>
<p><strong>Maximum Age:</strong> [Years]</p>
<p><strong>Age Relaxation:</strong> As per government rules</p>

<h2>Exam Pattern</h2>
<p><strong>Type of Exam:</strong> [Online/Offline]</p>
<p><strong>Number of Papers:</strong> [Details]</p>
<p><strong>Total Marks:</strong> [Details]</p>
<p><strong>Duration:</strong> [Time]</p>

<h2>Syllabus</h2>
<p>[Briefly outline the syllabus or provide link to detailed syllabus]</p>

<h2>Application Fee</h2>
<ul>
<li>General/OBC: Rs. [Amount]</li>
<li>SC/ST/PWD: Rs. [Amount]</li>
</ul>

<h2>How to Apply</h2>
<ol>
<li>Visit the official website</li>
<li>Register/Login</li>
<li>Fill application form</li>
<li>Upload documents</li>
<li>Pay application fee</li>
<li>Submit and save confirmation</li>
</ol>

<h2>Important Links</h2>
<p><a href="#">Official Website</a></p>
<p><a href="#">Online Application</a></p>
<p><a href="#">Download Notification</a></p>`
    },
    {
        id: 'tutorial',
        name: 'How-To Guide',
        category: 'Content',
        icon: 'graduation-cap',
        description: 'Step-by-step tutorial template',
        content: `<h1>How to [Task/Topic]</h1>

<h2>Introduction</h2>
<p>Brief introduction explaining what readers will learn and why it's useful.</p>

<h2>Prerequisites</h2>
<p>What you'll need before getting started:</p>
<ul>
<li>Requirement 1</li>
<li>Requirement 2</li>
<li>Requirement 3</li>
</ul>

<h2>Step 1: [First Step Title]</h2>
<p>Detailed explanation of the first step...</p>
<p><em>Tip: [Helpful tip for this step]</em></p>

<h2>Step 2: [Second Step Title]</h2>
<p>Detailed explanation of the second step...</p>
<p><em>Tip: [Helpful tip for this step]</em></p>

<h2>Step 3: [Third Step Title]</h2>
<p>Detailed explanation of the third step...</p>
<p><em>Tip: [Helpful tip for this step]</em></p>

<h2>Common Issues & Solutions</h2>
<p><strong>Problem:</strong> [Common problem]</p>
<p><strong>Solution:</strong> [How to fix it]</p>

<h2>Conclusion</h2>
<p>Summary of what was accomplished and next steps or additional resources.</p>`
    },
    {
        id: 'result-notice',
        name: 'Result Announcement',
        category: 'Results',
        icon: 'chart-line',
        description: 'Result announcement template',
        content: `<h1>Result Announcement: [Exam/Test Name]</h1>

<h2>Overview</h2>
<p><strong>Exam Name:</strong> [Full Name]</p>
<p><strong>Result Declaration Date:</strong> [Date]</p>
<p><strong>Exam Date:</strong> [Date]</p>

<h2>Important Information</h2>
<p>The results for [Exam Name] have been declared. Candidates can check their results using the details below.</p>

<h2>How to Check Results</h2>
<ol>
<li>Visit the official website: [URL]</li>
<li>Click on "Result" section</li>
<li>Enter your Roll Number/Registration Number</li>
<li>Enter Date of Birth</li>
<li>Click "Submit"</li>
<li>Your result will be displayed</li>
<li>Download and save for future reference</li>
</ol>

<h2>Result Statistics</h2>
<table>
<tr><td><strong>Total Candidates Appeared</strong></td><td>[Number]</td></tr>
<tr><td><strong>Candidates Passed</strong></td><td>[Number]</td></tr>
<tr><td><strong>Pass Percentage</strong></td><td>[Percentage]</td></tr>
</table>

<h2>Next Steps for Qualified Candidates</h2>
<p>Candidates who have qualified should:</p>
<ul>
<li>Download the result</li>
<li>Wait for further instructions</li>
<li>Prepare documents for next stage</li>
</ul>

<h2>Important Links</h2>
<p><a href="#">Check Result Online</a></p>
<p><a href="#">Download Merit List</a></p>
<p><a href="#">Official Website</a></p>`
    },
    {
        id: 'admit-card',
        name: 'Admit Card Notice',
        category: 'Exams',
        icon: 'id-card',
        description: 'Admit card release notification',
        content: `<h1>Admit Card Released: [Exam Name]</h1>

<h2>Overview</h2>
<p><strong>Exam Name:</strong> [Full Exam Name]</p>
<p><strong>Admit Card Release Date:</strong> [Date]</p>
<p><strong>Exam Date:</strong> [Date]</p>

<h2>Important Notice</h2>
<p>The admit cards for [Exam Name] are now available for download. All registered candidates must download their admit cards before the exam date.</p>

<h2>How to Download Admit Card</h2>
<ol>
<li>Visit the official website: [URL]</li>
<li>Click on "Download Admit Card"</li>
<li>Enter Registration Number</li>
<li>Enter Date of Birth/Password</li>
<li>Click "Submit"</li>
<li>Admit card will be displayed</li>
<li>Download and print</li>
</ol>

<h2>Details Available on Admit Card</h2>
<ul>
<li>Candidate Name and Photo</li>
<li>Roll Number</li>
<li>Exam Date and Time</li>
<li>Exam Center Address</li>
<li>Instructions for candidates</li>
</ul>

<h2>Important Instructions</h2>
<ul>
<li>Carry admit card and valid ID proof to exam center</li>
<li>Report at exam center 30 minutes before exam time</li>
<li>Check all details on admit card carefully</li>
<li>For any discrepancy, contact immediately: [Contact]</li>
</ul>

<h2>Documents Required at Exam Center</h2>
<ol>
<li>Admit Card (printed copy)</li>
<li>Original Photo ID (Aadhar/PAN/Driving License/Voter ID)</li>
<li>Recent passport size photograph</li>
</ol>

<h2>Important Links</h2>
<p><a href="#">Download Admit Card</a></p>
<p><a href="#">Exam Instructions</a></p>
<p><a href="#">Contact Support</a></p>`
    }
];

const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate, onClose }) => {
    const [templates, setTemplates] = useState<ContentTemplate[]>(DEFAULT_TEMPLATES);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);

    const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSelectTemplate = (template: ContentTemplate) => {
        if (confirm(`Apply "${template.name}" template? This will replace current content.`)) {
            onSelectTemplate(template.content);
            onClose?.();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="layer-group" />
                    Content Templates
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    >
                        <Icon name="times" />
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b bg-gray-50 space-y-3">
                <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Icon name="inbox" className="text-5xl mb-3" />
                        <p className="text-lg">No templates found</p>
                        <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                            >
                                {/* Template Card */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Icon name={template.icon} className="text-2xl text-blue-600" />
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                            {template.category}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {template.description}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewTemplate(template)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                                        >
                                            <Icon name="eye" />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleSelectTemplate(template)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                        >
                                            <Icon name="check" />
                                            Use This
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Template Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                                <Icon name="times" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                            />
                        </div>

                        {/* Preview Footer */}
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleSelectTemplate(previewTemplate);
                                    setPreviewTemplate(null);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Use This Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateManager;
