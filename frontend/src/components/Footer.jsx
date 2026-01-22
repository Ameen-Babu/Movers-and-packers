import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Truck, ChevronRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container footer-main-grid">
                <div className="footer-brand-col">
                    <div className="footer-logo">
                        <span className="footer-brand-name">HYDROX <span className="brand-accent">MOVERS</span></span>
                    </div>
                    <p className="footer-about-text">
                        Hydrox Movers & Logistics provides professional residential relocation, commercial shifting, and cargo transport across India and international routes.
                    </p>
                </div>

                <div className="footer-links-col">
                    <h4 className="footer-heading">Services</h4>
                    <ul className="footer-menu">
                        <li><Link to="/booking"><ChevronRight size={14} /> Household Relocation</Link></li>
                        <li><Link to="/booking"><ChevronRight size={14} /> Commercial & Office Shifting</Link></li>
                        <li><Link to="/booking"><ChevronRight size={14} /> Intercity Express Freight</Link></li>
                        <li><Link to="/booking"><ChevronRight size={14} /> Warehouse & Short Storage</Link></li>
                        <li><Link to="/booking"><ChevronRight size={14} /> Fragile & Artwork Crating</Link></li>
                    </ul>
                </div>

                <div className="footer-links-col">
                    <h4 className="footer-heading">Company</h4>
                    <ul className="footer-menu">
                        <li><Link to="/"><ChevronRight size={14} /> Home</Link></li>
                        <li><Link to="/about"><ChevronRight size={14} /> About Hydrox Movers</Link></li>
                        <li><Link to="/booking"><ChevronRight size={14} /> Instant Cost Calculator</Link></li>
                        <li><Link to="/contact"><ChevronRight size={14} /> Regional Hubs & Contact</Link></li>
                        <li><Link to="/orders"><ChevronRight size={14} /> Track Order Status</Link></li>
                    </ul>
                </div>

                <div className="footer-contact-col">
                    <h4 className="footer-heading">Headquarters & Dispatch</h4>
                    <div className="contact-line">
                        <MapPin size={16} className="c-icon" />
                        <span>Hydrox Logistics Park, NH 66 Transit Hub, Kochi, Kerala 682024</span>
                    </div>
                    <div className="contact-line">
                        <Phone size={16} className="c-icon" />
                        <span>Toll-Free Dispatch: 1800-HYDROX (493769)<br />Direct Line: +91 94000 00000</span>
                    </div>
                    <div className="contact-line">
                        <Mail size={16} className="c-icon" />
                        <span>dispatch@hydroxmovers.com</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="container bottom-content">
                    <p className="copyright-text">&copy; {new Date().getFullYear()} Hydrox Movers & Logistics Services Ltd. All Rights Reserved.</p>
                    <div className="footer-legal-links">
                        <Link to="/about">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/about">Terms of Service</Link>
                        <span>•</span>
                        <Link to="/contact">Carrier Disclosures</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;