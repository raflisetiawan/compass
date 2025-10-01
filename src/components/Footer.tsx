import uclLogo from '../assets/img/ucl-logo.png';
import ncitaLogo from '../assets/img/ncita-logo.png';

const Footer = () => (
  <footer className="w-full py-4">
    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="flex items-center space-x-6">
        <img src={uclLogo} alt="UCL Logo" className="h-6 sm:h-8 w-auto" />
        <img src={ncitaLogo} alt="NCITA Logo" className="h-6 sm:h-8 w-auto" />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 text-center">Bespoke. All rights reserved 2025</p>
    </div>
  </footer>
);

export default Footer;
