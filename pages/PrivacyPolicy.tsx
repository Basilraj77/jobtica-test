
import React, { useEffect } from 'react';
import StaticPage from '../components/StaticPage.tsx';
import { useData } from '../contexts/DataContext.tsx';

const PrivacyPolicy: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { seoSettings } = useData();
  useEffect(() => {
    document.title = `Privacy Policy | ${seoSettings.global.siteTitle}`;
  }, [seoSettings.global.siteTitle]);
  
  return (
    <StaticPage title="Privacy Policy" navigate={navigate}>
      <p className="lead">Last updated: October 26, 2025</p>
      <p><strong>Jobtica</strong> ("us", "we", or "our"), run by Divine Computer, Elathagiri, operates the Jobtica website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
      
      <h2>Information Collection and Use</h2>
      <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
      
      <h3>Types of Data Collected</h3>
      
      <h4>Personal Data</h4>
      <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (<strong>"Personal Data"</strong>). This may include, but is not limited to:</p>
      <ul>
        <li>Email address (for newsletter subscriptions)</li>
        <li>Name and contact details (when using the contact form)</li>
      </ul>

      <h4>Usage Data & Cookies</h4>
      <p>We automatically collect information on how the Service is accessed and used ("Usage Data"). This may include your IP address, browser type, pages visited, and other diagnostic data. We use cookies and similar tracking technologies to track activity on our Service and hold certain information.</p>
      <p>Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
      
      <h2>Google AdSense & DoubleClick DART Cookie</h2>
      <p>We use Google AdSense, a third-party advertising service, to display ads on our website. Google uses cookies to serve ads based on a user's prior visits to our website or other websites.</p>
      <ul>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
          <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
          <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>.</li>
      </ul>
      <p>For more information on how Google uses data, please visit <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google's advertising privacy policy</a>.</p>

      <h2>Affiliate Links</h2>
      <p>Our Service may contain affiliate links. This means we may earn a commission if you click on a link and make a purchase, at no additional cost to you. This helps support our website and allows us to continue providing valuable content. We only recommend products and services that we believe will add value to our users.</p>

      <h2>Use of Data</h2>
      <p><strong>Jobtica</strong> uses the collected data for various purposes:</p>
      <ul>
        <li>To provide and maintain our Service</li>
        <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested</li>
        <li>To serve advertisements through third-party partners like Google AdSense</li>
        <li>To manage our affiliate partnerships</li>
        <li>To notify you about changes to our Service</li>
        <li>To provide customer support and respond to inquiries</li>
        <li>To monitor the usage of the Service for improvement</li>
      </ul>

      <h2>Security of Data</h2>
      <p>The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

      <h2>Links to Other Sites</h2>
      <p>Our Service may contain links to other sites that are not operated by us (including affiliate links and advertisements). If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>

      <h2>Changes to This Privacy Policy</h2>
      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date at the top.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us through the contact form on our website.</p>
    </StaticPage>
  );
};

export default PrivacyPolicy;