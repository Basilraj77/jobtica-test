
import React, { useEffect } from 'react';
import StaticPage from '../components/StaticPage.tsx';
import { useData } from '../contexts/DataContext.tsx';

const AboutUs: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { seoSettings } = useData();
  useEffect(() => {
    document.title = `About Us | ${seoSettings.global.siteTitle}`;
  }, [seoSettings.global.siteTitle]);

  return (
    <StaticPage title="About Us" navigate={navigate}>
      <h2>Our Mission</h2>
      <p>Welcome to <strong>Jobtica</strong>, your number one source for all government job notifications. This site is proudly run by <strong>Divine Computer, Elathagiri</strong>. We're dedicated to giving you the very best and latest information, with a focus on accuracy, timeliness, and reliability.</p>
      <p>Our mission is to bridge the gap between job seekers and their dream government jobs. We understand the challenges of finding authentic information about government vacancies, and we strive to create a platform that simplifies this process, making it accessible to everyone across the country.</p>
      
      <h2>What We Offer</h2>
      <p>Our platform is designed to be a one-stop solution for government job aspirants. Here's what we provide:</p>
      <ul>
        <li><strong>Latest Job Openings:</strong> We provide timely updates on all central and state government job vacancies across various sectors like Banking, Railways, SSC, UPSC, Defence, and more.</li>
        <li><strong>Exam Notices:</strong> Stay informed about exam dates, admit card releases, and other important announcements.</li>
        <li><strong>Results:</strong> Get direct links and updates on the declaration of results for all major government examinations.</li>
        <li><strong>Career Guidance:</strong> Our blog section offers valuable tips, preparation strategies, and career guidance to help you succeed.</li>
      </ul>
      <p>To keep our services free for all users, Jobtica is supported by advertisements and affiliate links. This means that if you click on a link and make a purchase, we may receive a small commission at no extra cost to you. We appreciate your support!</p>
      <p>We hope you find our service as helpful as we enjoy offering it to you. If you have any questions or comments, please don't hesitate to contact us.</p>
      
      <p>
        Sincerely,
        <br />
        The Jobtica Team
      </p>
    </StaticPage>
  );
};

export default AboutUs;