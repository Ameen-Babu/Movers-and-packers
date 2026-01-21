import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="contact-page section-padding">
            <div className="container">
                <div className="section-header text-center">
                    <h2>Get In <span className="highlight">Touch</span></h2>
                    <p>Have questions? We'd love to hear from you.</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info glass-card">
                        <h3>Contact Information</h3>

                        <div className="info-item">
                            <div className="icon"><Phone size={20} /></div>
                            <div className="info-text">
                                <h5>Phone</h5>
                                <p>+91 9400522686</p>
                                <p>+91 9446001234</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon"><Mail size={20} /></div>
                            <div className="info-text">
                                <h5>Email</h5>
                                <p>info@hydroxmovers.com</p>
                                <p>support@hydroxmovers.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon"><MapPin size={20} /></div>
                            <div className="info-text">
                                <h5>Office</h5>
                                <p>123 Moving Street, Logistics Park<br />Kerala, India 673001</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container glass-card">
                        <div className="form-header">
                            <h3>Send Message</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Name Here"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="test@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Inquiry about..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-primary">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
