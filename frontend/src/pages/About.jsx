import React from 'react';
import { ShieldCheck, Truck, Users, Award, Clock, MapPin, CheckCircle2 } from 'lucide-react';

const About = () => {
    return (
        <div className="about-page-container">
            {/* Header Section */}
            <section className="about-hero-section section-padding bg-dark-slate">
                <div className="container text-center text-white">
                    <span className="sub-title text-amber">CORPORATE PROFILE</span>
                    <h1 className="hero-title text-white">Engineering Reliability in Logistics & Relocation</h1>
                    <p className="head-desc text-slate-300 max-w-700">
                        Hydrox Movers & Logistics Services is a licensed freight carrier delivering residential moving, commercial shifting, and heavy logistics solutions across India.
                    </p>
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="about-details-section section-padding">
                <div className="container">
                    <div className="about-grid-2">
                        <div className="about-text-content">
                            <span className="sub-title">OUR MISSION & GOVERNANCE</span>
                            <h2>Accountable, Transparent, and Damage-Free Relocation</h2>
                            <p>
                                Founded with the objective of eliminating ambiguity and informal practices in the Indian moving industry, Hydrox Movers operates under strict quality management procedures.
                            </p>
                            <p>
                                Every relocation task is managed by full-time, background-verified personnel equipped with heavy-duty packaging materials, custom wooden crates, and GPS-monitored sealed freight vehicles.
                            </p>

                            <div className="about-pillars-grid">
                                <div className="pillar-item">
                                    <ShieldCheck size={24} className="pillar-icon" />
                                    <div>
                                        <h4>Full Valuation Coverage</h4>
                                        <p>Comprehensive transit cargo insurance protecting every consignment.</p>
                                    </div>
                                </div>
                                <div className="pillar-item">
                                    <Truck size={24} className="pillar-icon" />
                                    <div>
                                        <h4>Owned Vehicle Fleet</h4>
                                        <p>No outsourced third-party trucks; 100% company owned & maintained.</p>
                                    </div>
                                </div>
                                <div className="pillar-item">
                                    <Users size={24} className="pillar-icon" />
                                    <div>
                                        <h4>Certified Moving Technicians</h4>
                                        <p>Trained in carpentry disassembly, fragile packing, and rigging.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="about-visual-card">
                            <img src="/warehouse.png" alt="Hydrox Movers Facility & Warehouse" className="about-facility-photo" />
                            <div className="facility-stats-box">
                                <div className="f-stat">
                                    <strong>15,400+</strong>
                                    <span>Successful Moves</span>
                                </div>
                                <div className="f-stat">
                                    <strong>50+</strong>
                                    <span>Cities Covered</span>
                                </div>
                                <div className="f-stat">
                                    <strong>99.4%</strong>
                                    <span>On-Time Dispatch</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Standard Badges */}
            <section className="about-certifications-section section-padding bg-slate-subtle">
                <div className="container">
                    <div className="section-head text-center">
                        <span className="sub-title">COMPLIANCE & STANDARDS</span>
                        <h2>Regulatory Accreditation & Safety Policies</h2>
                    </div>

                    <div className="cert-grid">
                        <div className="cert-card">
                            <Award size={32} className="cert-icon" />
                            <h4>Quality Management Standard</h4>
                            <p>Audited quality management standards governing packing, transport, and customer service.</p>
                        </div>
                        <div className="cert-card">
                            <ShieldCheck size={32} className="cert-icon" />
                            <h4>Govt. Licensed Carrier</h4>
                            <p>Authorized motor freight transport operator registered under Govt. Logistics Regulations.</p>
                        </div>
                        <div className="cert-card">
                            <Clock size={32} className="cert-icon" />
                            <h4>24/7 Operations Command</h4>
                            <p>Centralized fleet dispatch monitoring vehicle speeds, routes, and climate conditions.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
