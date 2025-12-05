import { Link } from 'react-router-dom';
import bespokeLogo from '../assets/img/bespoke-logo.png';

const BeSpokeLogo = () => (
  <Link to="/introduction" className="flex flex-col items-center hover:opacity-80 transition-opacity">
    <img src={bespokeLogo} alt="BeSpoke Logo" className="h-12 w-auto" />
  </Link>
);

export default BeSpokeLogo;
