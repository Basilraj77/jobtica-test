
import React, { useEffect } from 'react';
import StaticPage from '../components/StaticPage.tsx';
import { useData } from '../contexts/DataContext.tsx';

const TermsAndConditions: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { seoSettings } = useData();
  useEffect(() => {
    document.title = `Terms & Conditions | ${seoSettings.global.siteTitle}`;
  }, [seoSettings.global.siteTitle]);

  return (
    <StaticPage title="Terms and Conditions" navigate={navigate}>
      <p>Welcome to <strong>Jobtica</strong>. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern <strong>Jobtica's</strong> relationship with you in relation to this website.</p>
      <p>The term 'Jobtica' or 'us' or 'we' refers to the owner of the website, Divine Computer, Elathagiri. The term 'you' refers to the user or viewer of our website.</p>
      <p>The use of this website is subject to the following terms of use:</p>
      
      <ol>
        <li>
          <strong>Acceptance of Terms</strong>
          <p>By accessing this website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you disagree with any part of these terms and conditions, please do not use our website.</p>
        </li>
        <li>
          <strong>Use of the Website</strong>
          <p>The content of the pages of this website is for your general information and use only. It is subject to change without notice. Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.</p>
        </li>
        <li>
          <strong>Third-Party Links, Advertisements, and Affiliates</strong>
          <p>This website may contain links to third-party websites, including advertisements from services like Google AdSense and affiliate links. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content, privacy policies, or practices of the linked website(s). You acknowledge and agree that we are not responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.</p>
        </li>
        <li>
          <strong>Intellectual Property</strong>
          <p>This website contains material which is owned by or licensed to us. This material includes, but is not to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</p>
        </li>
        <li>
          <strong>User Conduct</strong>
          <p>You agree not to use the website in a way that may cause the website to be interrupted, damaged, rendered less efficient, or such that the effectiveness or functionality of the website is in any way impaired. You agree not to attempt any unauthorized access to any part or component of the website.</p>
        </li>
        <li>
          <strong>Limitation of Liability</strong>
          <p>In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>
          <p>Every effort is made to keep the website up and running smoothly. However, <strong>Jobtica</strong> takes no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.</p>
        </li>
        <li>
          <strong>Governing Law</strong>
          <p>Your use of this website and any dispute arising out of such use of the website is subject to the laws of India.</p>
        </li>
      </ol>
    </StaticPage>
  );
};

export default TermsAndConditions;