import React from 'react';
import { Users, Award, Shield, Clock } from 'lucide-react';

const About = () => {
    return (
        <div className="about-page section-padding">
            <div className="container">
                <div className="section-header text-center about-header">
                    <h2>About <span className="highlight">Hydrox Movers</span></h2>
                    <p className="subtitle">Your trusted partner in hassle-free relocation services since 2010.</p>
                </div>

                <div className="about-content glass-card">
                    <div className="about-grid">
                        <div className="about-text">
                            <h3>Who We Are</h3>
                            <p>
                                Hydrox Movers is a premier packing and moving company dedicated to making your relocation experience smooth, efficient, and stress-free. With over a decade of experience, we have mastered the art of safe and secure transportation of your valuable belongings.
                            </p>
                            <p>
                                Our team of professional packers and movers are trained to handle everything from delicate antiques to heavy furniture with the utmost care. We use high-quality packing materials and modern equipment to ensure zero damage during transit.
                            </p>
                        </div>
                        <div className="about-stats-container">
                            <div className="stat-card">
                                <h2 className="highlight">10k+</h2>
                                <p>Moves Completed</p>
                            </div>
                            <div className="stat-card">
                                <h2 className="highlight">98%</h2>
                                <p>Happy Customers</p>
                            </div>
                            <div className="stat-card">
                                <h2 className="highlight">50+</h2>
                                <p>Cities Covered</p>
                            </div>
                            <div className="stat-card">
                                <h2 className="highlight">15+</h2>
                                <p>Awards Won</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-features">
                        <div className="feature-item text-center">
                            <div className="icon-box">
                                <Users size={24} />
                            </div>
                            <h4>Expert Team</h4>
                            <p>Professional and verified staff</p>
                        </div>
                        <div className="feature-item text-center">
                            <div className="icon-box">
                                <Shield size={24} />
                            </div>
                            <h4>Safe & Secure</h4>
                            <p>Insurance coverage for goods</p>
                        </div>
                        <div className="feature-item text-center">
                            <div className="icon-box">
                                <Clock size={24} />
                            </div>
                            <h4>On-Time Delivery</h4>
                            <p>Punctual pickup and drop</p>
                        </div>
                        <div className="feature-item text-center">
                            <div className="icon-box">
                                <Award size={24} />
                            </div>
                            <h4>Best Price</h4>
                            <p>Affordable and transparent pricing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
