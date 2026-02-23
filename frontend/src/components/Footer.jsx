import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-brand">
                    <h2 className="logo">HYDROX <span className="logo-highlight">MOVERS</span></h2>
                    <p className="footer-desc">
                        Professional moving and packing services you can trust. Making your transition smooth and stress-free.
                    </p>
                    <div className="social-links">
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home page</a></li>
                        <li><a href="/contact">Communication</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h3>Contact Us</h3>
                    <div className="contact-item">
                        <MapPin size={18} className="contact-icon" />
                        <span>Address goes here, City, Country</span>
                    </div>
                    <div className="contact-item">
                        <Phone size={18} className="contact-icon" />
                        <span>+91 9400522686</span>
                    </div>
                    <div className="contact-item">
                        <Mail size={18} className="contact-icon" />
                        <span>info@hydroxmovers.com</span>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; 2026 All Rights Reserved. Design by Ameen A.G</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
