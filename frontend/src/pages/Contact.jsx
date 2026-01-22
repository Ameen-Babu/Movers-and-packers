import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="contact-page-container">
            {/* Header */}
            <section className="contact-hero section-padding bg-dark-slate">
                <div className="container text-center text-white">
                    <span className="sub-title text-amber">COMMUNICATION & BRANCHES</span>
                    <h1 className="hero-title text-white">Get in Touch With Dispatch HQ</h1>
                    <p className="head-desc text-slate-300 max-w-700">
                        Our logistics dispatch team is available 24/7 to assist with quotes, order tracking, and emergency moving support.
                    </p>
                </div>
            </section>

            <section className="contact-main-section section-padding">
                <div className="container">
                    <div className="contact-grid-2">
                        {/* Contact Info Side */}
                        <div className="contact-info-panel">
                            <h3>Regional Hubs & Hotlines</h3>
                            <p className="info-intro">For urgent booking changes or live fleet status, contact our dispatch desks directly.</p>

                            <div className="contact-card-item">
                                <div className="c-icon-box"><Phone size={20} /></div>
                                <div>
                                    <h5>Toll-Free Dispatch</h5>
                                    <p className="contact-highlight">1800-HYDROX (493769)</p>
                                    <p className="contact-sub">+91 94000 00000 | +91 94460 01234</p>
                                </div>
                            </div>

                            <div className="contact-card-item">
                                <div className="c-icon-box"><Mail size={20} /></div>
                                <div>
                                    <h5>Official Email Inquiry</h5>
                                    <p className="contact-highlight">dispatch@hydroxmovers.com</p>
                                    <p className="contact-sub">support@hydroxmovers.com</p>
                                </div>
                            </div>

                            <div className="contact-card-item">
                                <div className="c-icon-box"><MapPin size={20} /></div>
                                <div>
                                    <h5>Central Dispatch Headquarters</h5>
                                    <p className="contact-highlight">Hydrox Logistics Park, NH 66 Transit Hub</p>
                                    <p className="contact-sub">Kochi, Kerala 682024, India</p>
                                </div>
                            </div>

                            <div className="contact-card-item">
                                <div className="c-icon-box"><Clock size={20} /></div>
                                <div>
                                    <h5>Operational Hours</h5>
                                    <p className="contact-highlight">24/7 Customer & Fleet Support</p>
                                    <p className="contact-sub">Office Survey Hours: 8:00 AM - 8:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="contact-form-panel">
                            {submitted ? (
                                <div className="contact-success-box">
                                    <CheckCircle2 size={48} className="success-icon" />
                                    <h3>Message Received</h3>
                                    <p>Thank you for reaching out to Hydrox Movers. A logistics manager will contact you within 30 minutes.</p>
                                    <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another Inquiry</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="corporate-contact-form">
                                    <h3>Submit a Direct Inquiry</h3>
                                    <p className="form-subtext">Fill in the fields below for corporate moving proposals, partnership inquiries, or general questions.</p>

                                    <div className="form-row-2">
                                        <div className="form-group-block">
                                            <label>Full Name *</label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange}
                                                required 
                                                placeholder="e.g. Rahul Sharma" 
                                            />
                                        </div>
                                        <div className="form-group-block">
                                            <label>Phone Number *</label>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleChange}
                                                required 
                                                placeholder="+91 98765 43210" 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row-2">
                                        <div className="form-group-block">
                                            <label>Email Address *</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange}
                                                required 
                                                placeholder="name@example.com" 
                                            />
                                        </div>
                                        <div className="form-group-block">
                                            <label>Subject</label>
                                            <select name="subject" value={formData.subject} onChange={handleChange}>
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Residential Moving">Residential Moving</option>
                                                <option value="Corporate Shift">Corporate / Office Shift</option>
                                                <option value="Carrier Partnership">Carrier Partnership</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group-block">
                                        <label>Message / Relocation Details *</label>
                                        <textarea 
                                            name="message" 
                                            value={formData.message} 
                                            onChange={handleChange}
                                            required 
                                            rows="5"
                                            placeholder="Provide details about your move origin, destination, and dates..."
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn-primary-block">
                                        Submit Inquiry <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
