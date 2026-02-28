import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Truck, Package, Clock, Star, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="home-page">
            <section className="hero">
                <div className="container hero-content">
                    <span className="hero-badge">MANAGE FROM ONE CENTER!</span>
                    <h1>From Your Country to <span className="highlight">22+ Countries</span></h1>
                    <p>You can send fast, high quality and reasonable prices with Hydrox Movers.</p>
                    <div className="hero-btns">
                        <button className="btn-primary" onClick={() => navigate('/booking')}>Book Service</button>
                        <button className="btn-outline-white">Learn More</button>
                    </div>
                </div>
            </section>
            <section className="services section-padding">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Our Services</h2>
                        <p>We provide a wide range of logistics and moving services</p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card glass-card">
                            <div className="service-icon"><Package /></div>
                            <h3>Packing Services</h3>
                            <p>Materials supply (boxes, bubble wrap, tape, etc.) and systematic packing.</p>
                            <ul className="service-features">
                                <li>Room-by-room packing</li>
                                <li>Fragile item handling</li>
                                <li>Duration: 4-10 hours</li>
                            </ul>
                        </div>
                        <div className="service-card glass-card">
                            <div className="service-icon"><Truck /></div>
                            <h3>Loading & Transport</h3>
                            <p>Strategic loading and GPS-tracked transportation to your destination.</p>
                            <ul className="service-features">
                                <li>Multiple vehicle options</li>
                                <li>Strategic loading</li>
                                <li>Real-time tracking</li>
                            </ul>
                        </div>
                        <div className="service-card glass-card">
                            <div className="service-icon"><Clock /></div>
                            <h3>Unloading & Unpacking</h3>
                            <p>Safe unloading and room-by-room unpacking for a seamless transition.</p>
                            <ul className="service-features">
                                <li>Furniture assembly</li>
                                <li>Safe unloading</li>
                                <li>Duration: 2-12 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section className="features section-padding bg-dark">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <Shield className="feature-icon" size={48} />
                            <h4>Safe & Secure</h4>
                            <p>Your belongings are insured and handled with extreme care.</p>
                        </div>
                        <div className="feature-item">
                            <Star className="feature-icon" size={48} />
                            <h4>Top Rated</h4>
                            <p>Thousands of happy customers across 22+ countries.</p>
                        </div>
                        <div className="feature-item">
                            <Truck className="feature-icon" size={48} />
                            <h4>Fast Delivery</h4>
                            <p>Optimized routes to ensure your items arrive on time.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="feedback section-padding">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Customer Feedback</h2>
                        <p>Hear from our great clients who moved with us</p>
                    </div>
                    <div className="feedback-grid">
                        <div className="review-card glass-card">
                            <div className="stars">
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                            </div>
                            <p className="review-text">
                                "Smooth service with great care and timing. Movers worked efficiently and packed everything safely.
                                Friendly team that made the process stress-free."
                            </p>
                            <div className="reviewer">
                                <div className="reviewer-img">F</div>
                                <div className="reviewer-info">
                                    <h4>Fredin</h4>
                                    <p>Business Owner</p>
                                </div>
                            </div>
                        </div>
                        <div className="review-card glass-card">
                            <div className="stars">
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                            </div>
                            <p className="review-text">
                                "The best moving experience I've ever had. They handled my fragile piano with such grace.
                                Highly recommended for international moves!"
                            </p>
                            <div className="reviewer">
                                <div className="reviewer-img">A</div>
                                <div className="reviewer-info">
                                    <h4>Alwyn</h4>
                                    <p>Freelancer</p>
                                </div>
                            </div>
                        </div>
                        <div className="review-card glass-card">
                            <div className="stars">
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} fill="var(--primary)" />
                                <Star size={18} />
                            </div>
                            <p className="review-text">
                                "Fast, reliable, and very affordable. The tracking system gave me peace of mind throughout the journey.
                                Five stars for the team!"
                            </p>
                            <div className="reviewer">
                                <div className="reviewer-img">S</div>
                                <div className="reviewer-info">
                                    <h4>Sarah J.</h4>
                                    <p>Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="cta section-padding">
                <div className="container">
                    <div className="cta-content glass-card">
                        <h2>Ready to move with <span className="highlight">Hydrox?</span></h2>
                        <p>Get a free quote today and experience the best moving service.</p>
                        <button className="btn-primary" onClick={() => navigate('/booking')}>Get Started Now <ArrowRight size={20} /></button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
