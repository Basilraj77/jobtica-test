import React, { useState } from 'react';
import { Job } from '../types.ts';
import Icon from './Icon.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { slugify } from '../utils/slugify';
import Modal from './Modal.tsx';
import AdComponent from './AdComponent.tsx';
import { useData } from '../contexts/DataContext.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { getAdCodeForPlacement } from '../utils/jobUtils';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface JobDetailViewProps {
  job: Job;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({ job }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { adSettings } = useData();
  const jobDetailTopAdCode = getAdCodeForPlacement('jobDetailTopAd', adSettings);

  const hasPrepMaterials = (job.affiliateCourses && job.affiliateCourses.length > 0) || (job.affiliateBooks && job.affiliateBooks.length > 0);

  const jobUrl = `${window.location.origin}${import.meta.env.BASE_URL}/job/${slugify(job.title)}`.replace(/([^:]\/)\/+/g, "$1");
  const shareTitle = `Check out this job: ${job.title}`;
  const summary = job.description.substring(0, 100) + '...';
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(shareTitle)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(summary)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + "\n\n" + jobUrl)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent("I found this job and thought you might be interested:\n\n" + jobUrl)}`;


  const handleConfirmRedirect = () => {
    window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    setIsModalOpen(false);
  };

  return (
    <>
      <article className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        {jobDetailTopAdCode && (
            <div className="mb-6 -mx-6 -mt-6 md:-mx-8 md:-mt-8 rounded-t-lg overflow-hidden">
                <AdComponent code={jobDetailTopAdCode} placement="header" />
            </div>
        )}
        <h1 className="text-4xl font-bold text-[#1e3c72] mb-4">{job.title}</h1>
        <div className="text-base text-gray-600 mb-6 border-b pb-4 flex flex-wrap gap-x-6 gap-y-2">
          <span><Icon name="building" className="mr-2 text-gray-400" />{job.department}</span>
          <span><Icon name="tag" className="mr-2 text-gray-400" />{job.category}</span>
          <span><Icon name="graduation-cap" className="mr-2 text-gray-400" />{job.qualification}</span>
          <span><Icon name="briefcase" className="mr-2 text-gray-400" />{job.vacancies} Vacancies</span>
          <span><Icon name="calendar-check" className="mr-2 text-gray-400" />Posted: {job.postedDate}</span>
          <span><Icon name="calendar-alt" className="mr-2 text-gray-400" />Last Date: {job.lastDate}</span>
        </div>

        <div className="static-content">
          <h2>Job Description</h2>
          <MarkdownRenderer content={job.description} />
        </div>

        {hasPrepMaterials && (
            <section className="mt-8 pt-6 border-t">
                <h2 className="text-3xl font-bold text-[#1e3c72] mb-6 flex items-center gap-3"><Icon name="book-reader" /> Prepare for this Exam</h2>
                
                {job.affiliateCourses && job.affiliateCourses.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Courses</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {job.affiliateCourses.map(course => (
                                <div key={course.id} className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-gray-800">{course.title}</p>
                                        <p className="text-sm text-gray-500 mb-2">Platform: {course.platform}</p>
                                    </div>
                                    <a href={course.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 text-sm bg-[var(--primary-color)] text-white text-center px-3 py-2 rounded-md font-semibold filter hover:brightness-90">
                                        View Course
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {job.affiliateBooks && job.affiliateBooks.length > 0 && (
                     <div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Books</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {job.affiliateBooks.map(book => (
                                <div key={book.id} className="border rounded-lg p-4 text-center flex flex-col justify-between hover:shadow-md transition-shadow">
                                    {book.imageUrl && <img src={book.imageUrl} alt={book.title} className="h-40 mx-auto mb-2 object-contain" loading="lazy" />}
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{book.title}</p>
                                        <p className="text-xs text-gray-500 mb-2">by {book.author}</p>
                                    </div>
                                    <a href={book.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 text-sm bg-yellow-500 text-black px-3 py-2 rounded-md font-semibold hover:bg-yellow-600">
                                        Buy on Amazon
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        )}

        <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t">
          <div className="flex items-center gap-4 text-gray-500 mb-4 sm:mb-0">
            <span className="text-sm font-semibold">Share this job:</span>
            <a href={facebookShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Facebook" className="hover:text-blue-600 transition-colors"><Icon prefix="fab" name="facebook-f" className="text-xl" /></a>
            <a href={twitterShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Twitter" className="hover:text-sky-500 transition-colors"><Icon prefix="fab" name="twitter" className="text-xl" /></a>
            <a href={linkedinShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on LinkedIn" className="hover:text-blue-700 transition-colors"><Icon prefix="fab" name="linkedin-in" className="text-xl" /></a>
            <a href={whatsappShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on WhatsApp" className="hover:text-green-500 transition-colors"><Icon prefix="fab" name="whatsapp" className="text-xl" /></a>
            <a href={telegramShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Telegram" className="hover:text-blue-400 transition-colors"><Icon prefix="fab" name="telegram-plane" className="text-xl" /></a>
            <a href={emailShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share via Email" className="hover:text-gray-700 transition-colors"><Icon name="envelope" className="text-xl" /></a>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-bold py-3 px-6 rounded-md bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] text-white filter hover:brightness-110"
          >
            Apply Now
          </button>
        </div>
      </article>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm External Navigation">
        <div className="space-y-6">
          <p className="text-gray-600">
            You are being redirected to the official application page. Please be aware that you are leaving our website, and we are not responsible for the content or practices of external sites.
          </p>
          <div className="font-semibold text-gray-800 break-all bg-gray-50 p-3 rounded-md border">
            <p className="text-xs text-gray-500 mb-1">Destination URL:</p>
            <Icon name="link" className="mr-2 text-gray-400" />
            {job.applyLink}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRedirect}
              className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90"
            >
              Proceed to Apply
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobDetailView;
