import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Shield, Truck, Clock, Package, MapPin, DollarSign, Award, Users, AlertCircle } from 'lucide-react';

const CITIES = [
  'Kochi', 'Bangalore', 'Trivandrum', 'Chennai', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Calicut', 'Coimbatore', 'Pune'
];

const SERVICE_TYPES = [
  { id: '1bhk', label: '1 BHK Apartment Move', basePrice: 4500, perKm: 16 },
  { id: '2bhk', label: '2-3 BHK House Move', basePrice: 7800, perKm: 22 },
  { id: 'villa', label: 'Large Villa / 4+ BHK', basePrice: 12500, perKm: 28 },
  { id: 'office', label: 'Commercial / Office Shift', basePrice: 14000, perKm: 30 },
  { id: 'single', label: 'Single Furniture / Fragile Only', basePrice: 2500, perKm: 12 }
];

const Home = () => {
    const navigate = useNavigate();

    
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [moveType, setMoveType] = useState('2bhk');
    const [moveDate, setMoveDate] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    });

    
    const [openFaq, setOpenFaq] = useState(0);

    
    const selectedService = SERVICE_TYPES.find(s => s.id === moveType) || SERVICE_TYPES[1];
    let distanceEst = 350;
    if (pickup === dropoff) distanceEst = 25;
    else if ((pickup === 'Kochi' && dropoff === 'Trivandrum') || (pickup === 'Trivandrum' && dropoff === 'Kochi')) distanceEst = 210;
    else if ((pickup === 'Kochi' && dropoff === 'Bangalore') || (pickup === 'Bangalore' && dropoff === 'Kochi')) distanceEst = 540;
    else if ((pickup === 'Bangalore' && dropoff === 'Chennai') || (pickup === 'Chennai' && dropoff === 'Bangalore')) distanceEst = 340;
    else distanceEst = 680;

    const calculatedSubtotal = selectedService.basePrice + (distanceEst * selectedService.perKm);
    const estimatedPrice = Math.round(calculatedSubtotal);

    const handleQuickQuoteSubmit = (e) => {
        e.preventDefault();
        navigate('/booking', {
            state: {
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                serviceType: moveType,
                movingDate: moveDate,
                estimatedPrice: estimatedPrice
            }
        });
    };

    return (
        <div className="home-page-container">
            
            <section className="hero-centered-section">
                <div className="container text-center hero-centered-content">
                    <h1 className="hero-centered-title">
                        Relocation & Moving <span className="title-highlight">Made Effortless.</span>
                    </h1>
                    <p className="hero-centered-desc">
                        Calculate instant binding rates for home shifting, commercial office relocation, and express freight across India.
                    </p>

                    
                    <div className="hero-floating-search-bar">
                        <form onSubmit={handleQuickQuoteSubmit} className="search-bar-form">
                            <div className="search-bar-field">
                                <label>Pickup</label>
                                <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="search-bar-divider"></div>

                            <div className="search-bar-field">
                                <label>Destination</label>
                                <select value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="search-bar-divider"></div>

                            <div className="search-bar-field">
                                <label>Move Type</label>
                                <select value={moveType} onChange={(e) => setMoveType(e.target.value)}>
                                    {SERVICE_TYPES.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="search-bar-divider"></div>

                            <div className="search-bar-field">
                                <label>Date</label>
                                <input 
                                    type="date" 
                                    value={moveDate} 
                                    onChange={(e) => setMoveDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="search-bar-action">
                                <div className="search-bar-price">
                                    <span className="price-title">Est. Fare</span>
                                    <strong className="price-num">₹{estimatedPrice.toLocaleString('en-IN')}</strong>
                                </div>
                                <button type="submit" className="btn-search-submit">
                                    Book Move <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            
            <section className="metrics-bar-section">
                <div className="container metrics-grid">
                    <div className="metric-box">
                        <span className="metric-number">15,400+</span>
                        <span className="metric-label">Completed Relocations</span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-number">50+</span>
                        <span className="metric-label">Cities Covered Nationwide</span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-number">100%</span>
                        <span className="metric-label">Background Checked Crew</span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-number">0%</span>
                        <span className="metric-label">Hidden Surcharges Policy</span>
                    </div>
                </div>
            </section>

            
            <section className="services-section section-padding">
                <div className="container">
                    <div className="section-head text-center">
                        <span className="sub-title">CORE LOGISTICS SOLUTIONS</span>
                        <h2>Relocation Services Engineered for Zero Damage</h2>
                        <p className="head-desc">We operate standard industrial packing protocols, heavy-duty cargo trucks, and trained assembly technicians.</p>
                    </div>

                    <div className="services-corporate-grid">
                        
                        <div className="corporate-service-card">
                            <div className="service-img-wrapper">
                                <img src="/packing_team.png" alt="Household Packing" />
                            </div>
                            <div className="service-card-body">
                                <h3>Household Shifting</h3>
                                <p>Comprehensive residential moving for 1 BHK to luxury villas. Includes room-by-room multi-layer packing, glass protective wrap, and furniture disassembly.</p>
                                <ul className="card-spec-list">
                                    <li><CheckCircle2 size={15} /> 5-Layer Corrugated Box Packing</li>
                                    <li><CheckCircle2 size={15} /> Wardrobe Boxes & Mattress Covers</li>
                                    <li><CheckCircle2 size={15} /> Same-day Local Shifting Available</li>
                                </ul>
                                <Link to="/booking" className="service-link-btn">Book Household Move <ArrowRight size={16} /></Link>
                            </div>
                        </div>

                        
                        <div className="corporate-service-card">
                            <div className="service-img-wrapper">
                                <img src="/warehouse.png" alt="Warehouse & Commercial Storage" />
                            </div>
                            <div className="service-card-body">
                                <h3>Office & Commercial Relocation</h3>
                                <p>Structured corporate shifting designed for minimal business downtime. Desktop IT racking, file indexing, workstation dismantling, and off-hours execution.</p>
                                <ul className="card-spec-list">
                                    <li><CheckCircle2 size={15} /> Weekend & Night Shift Moving</li>
                                    <li><CheckCircle2 size={15} /> IT Server & Equipment Crating</li>
                                    <li><CheckCircle2 size={15} /> Dedicated Project Manager</li>
                                </ul>
                                <Link to="/booking" className="service-link-btn">Book Corporate Move <ArrowRight size={16} /></Link>
                            </div>
                        </div>

                        
                        <div className="corporate-service-card">
                            <div className="service-img-wrapper">
                                <img src="/hero_truck.png" alt="Intercity Direct Transit" />
                            </div>
                            <div className="service-card-body">
                                <h3>Intercity Express Freight</h3>
                                <p>Direct point-to-point interstate moving. Your goods are transported in dedicated container trucks without co-loading or intermediate transfers.</p>
                                <ul className="card-spec-list">
                                    <li><CheckCircle2 size={15} /> Live GPS Tracking Access</li>
                                    <li><CheckCircle2 size={15} /> Guaranteed Transit Schedule</li>
                                    <li><CheckCircle2 size={15} /> Interstate Tolls Included</li>
                                </ul>
                                <Link to="/booking" className="service-link-btn">Book Intercity Transit <ArrowRight size={16} /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="comparison-section section-padding bg-slate-subtle">
                <div className="container">
                    <div className="section-head text-center">
                        <span className="sub-title">INDUSTRY STANDARDS</span>
                        <h2>Why Choose Hydrox Movers Over Standard Local Operators</h2>
                        <p className="head-desc">Clear contractual guarantees, transparent billing, and accountable professional management.</p>
                    </div>

                    <div className="comparison-table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Service Standard & Feature</th>
                                    <th className="highlight-col">Hydrox Movers (Professional Standard)</th>
                                    <th>Informal Local Operators</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Price Guarantee</strong></td>
                                    <td className="highlight-col">Written fixed quotation before dispatch</td>
                                    <td>Unexpected extra fees on delivery day</td>
                                </tr>
                                <tr>
                                    <td><strong>Cargo Insurance Coverage</strong></td>
                                    <td className="highlight-col">Full transit insurance claim backup included</td>
                                    <td>Zero formal damage liability</td>
                                </tr>
                                <tr>
                                    <td><strong>Crew Professionalism</strong></td>
                                    <td className="highlight-col">Uniformed, background-checked full-time staff</td>
                                    <td>Untrained daily wage contract labor</td>
                                </tr>
                                <tr>
                                    <td><strong>Vehicle Tracking</strong></td>
                                    <td className="highlight-col">Real-time GPS location sharing for clients</td>
                                    <td>No transit location visibility</td>
                                </tr>
                                <tr>
                                    <td><strong>Packing Materials</strong></td>
                                    <td className="highlight-col">New 5-layer boxes, bubble wrap, custom crates</td>
                                    <td>Used/recycled low-grade boxes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            
            <section className="workflow-section section-padding">
                <div className="container">
                    <div className="section-head text-center">
                        <span className="sub-title">CLEAR PROCESS</span>
                        <h2>4-Step Standardized Moving Workflow</h2>
                        <p className="head-desc">Structured execution to make your moving experience predictable and effortless.</p>
                    </div>

                    <div className="workflow-steps-grid">
                        <div className="workflow-card">
                            <div className="step-number">01</div>
                            <h4>Quote & Inventory Survey</h4>
                            <p>Submit move details online or request a physical survey. Receive a binding itemized estimate with zero hidden costs.</p>
                        </div>
                        <div className="workflow-card">
                            <div className="step-number">02</div>
                            <h4>White-Glove Packing</h4>
                            <p>On move day, our trained crew arrives on time with high-grade packing materials, protective blankets, and labels.</p>
                        </div>
                        <div className="workflow-card">
                            <div className="step-number">03</div>
                            <h4>GPS-Monitored Transit</h4>
                            <p>Goods are systematically loaded into padded container vehicles and transported directly along optimal highways.</p>
                        </div>
                        <div className="workflow-card">
                            <div className="step-number">04</div>
                            <h4>Unpacking & Setup</h4>
                            <p>At destination, crew unloads, unpacks room-by-room, reassembles furniture, and disposes of packing debris.</p>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="fleet-section section-padding bg-dark-slate">
                <div className="container">
                    <div className="section-head text-center text-white">
                        <span className="sub-title text-amber">OUR VEHICLE FLEET</span>
                        <h2>Dedicated Logistics Vehicles Built for Safe Transit</h2>
                        <p className="head-desc text-slate-300">All vehicles undergo regular mechanical safety audits and feature sealed weather-proof cargo bodies.</p>
                    </div>

                    <div className="fleet-grid">
                        <div className="fleet-card">
                            <div className="fleet-header">
                                <div>
                                    <h3>14ft City Express Container</h3>
                                    <span className="fleet-capacity">Payload: 2.5 Tons</span>
                                </div>
                            </div>
                            <p className="fleet-desc">Ideal for 1-2 BHK apartment moves within metropolitan limits and narrow suburban streets.</p>
                            <div className="fleet-specs">
                                <span>• Weatherproof Sealed Body</span>
                                <span>• Rear Hydraulic Loader</span>
                                <span>• Inner Wall Padding</span>
                            </div>
                        </div>

                        <div className="fleet-card">
                            <div className="fleet-header">
                                <div>
                                    <h3>19ft Commercial Heavy Carrier</h3>
                                    <span className="fleet-capacity">Payload: 5.5 Tons</span>
                                </div>
                            </div>
                            <p className="fleet-desc">Designed for 3-4 BHK household shifting and intercity highway transit between major hubs.</p>
                            <div className="fleet-specs">
                                <span>• Dual Axle Air Suspension</span>
                                <span>• GPS Real-time Telematics</span>
                                <span>• Heavy Furniture Tie-downs</span>
                            </div>
                        </div>

                        <div className="fleet-card">
                            <div className="fleet-header">
                                <div>
                                    <h3>24ft Multi-Axle Freight Trailer</h3>
                                    <span className="fleet-capacity">Payload: 10+ Tons</span>
                                </div>
                            </div>
                            <p className="fleet-desc">Specialized vehicle for corporate office relocations, factory equipment, and multi-unit projects.</p>
                            <div className="fleet-specs">
                                <span>• Climate Control Ready</span>
                                <span>• Certified Heavy Duty Ramp</span>
                                <span>• Full Cargo Perimeter Locks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="reviews-section section-padding">
                <div className="container">
                    <div className="section-head text-center">
                        <span className="sub-title">VERIFIED CLIENT REVIEWS</span>
                        <h2>Real Experiences From Recent Relocations</h2>
                        <p className="head-desc">Read feedback from clients who completed moves with Hydrox Movers.</p>
                    </div>

                    <div className="reviews-grid">
                        <div className="review-box">
                            <div className="review-header">
                                <div>
                                    <strong>Rajesh Kumar</strong>
                                    <span className="review-meta">Kochi to Bangalore • 3 BHK Move</span>
                                </div>
                                <span className="review-rating">★★★★★ 5.0</span>
                            </div>
                            <p className="review-body">
                                "Hydrox Movers handled our move from Kochi to Bangalore smoothly. The crew wrapped all our wooden furniture with thick protective padding. Truck arrived right on schedule."
                            </p>
                        </div>

                        <div className="review-box">
                            <div className="review-header">
                                <div>
                                    <strong>Anjali Menon</strong>
                                    <span className="review-meta">Trivandrum Local • 2 BHK Apartment</span>
                                </div>
                                <span className="review-rating">★★★★★ 5.0</span>
                            </div>
                            <p className="review-body">
                                "Extremely professional team. No bargaining or unexpected extra charges on moving day. Everything quoted online was honored. Highly recommended for hassle-free shifting."
                            </p>
                        </div>

                        <div className="review-box">
                            <div className="review-header">
                                <div>
                                    <strong>Siddharth Sharma</strong>
                                    <span className="review-meta">Corporate Shift • IT Park, Kochi</span>
                                </div>
                                <span className="review-rating">★★★★★ 5.0</span>
                            </div>
                            <p className="review-body">
                                "We relocated our 45-seat IT office over a single weekend. All dual monitors, servers, and ergonomic chairs were packed in custom crates without a single scratch."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="faq-section section-padding bg-slate-subtle">
                <div className="container faq-container-narrow">
                    <div className="section-head text-center">
                        <span className="sub-title">FREQUENTLY ASKED QUESTIONS</span>
                        <h2>Everything You Need to Know Before Moving</h2>
                    </div>

                    <div className="faq-accordion">
                        {[
                            {
                                q: "How is the moving price calculated?",
                                a: "Prices are based on transit distance (in km), cargo volume/weight class (e.g. 1 BHK vs 3 BHK), packaging grade selected, and floor levels/elevator accessibility. All quotes provided by Hydrox Movers are binding with zero hidden charges."
                            },
                            {
                                q: "Are my belongings insured during transit?",
                                a: "Yes. All moves include mandatory transit insurance options covering damage or loss due to road accidents or fire. Additional full-value replacement insurance is available for high-value items."
                            },
                            {
                                q: "How far in advance should I book my move?",
                                a: "For local intra-city moves, 24 to 48 hours notice is sufficient. For interstate long-distance relocations, we recommend booking 3 to 5 days in advance to reserve dedicated container trucks."
                            },
                            {
                                q: "Do you dismantle and reassemble furniture?",
                                a: "Yes. Our crew includes trained carpentry tools and handlers who dismantle beds, wardrobes, dining tables, and modular units at pickup, and reassemble them at your new location."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                                <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                                    <span>{item.q}</span>
                                    {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === idx && (
                                    <div className="faq-answer">
                                        <p>{item.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            
            <section className="cta-banner-section">
                <div className="container cta-box-corporate">
                    <div className="cta-left">
                        <h2>Planning a Move Soon? Get a Guaranteed Quote Today.</h2>
                        <p>Speak directly with our logistics dispatch manager or calculate instant prices online.</p>
                    </div>
                    <div className="cta-right-btns">
                        <Link to="/booking" className="btn-cta-primary">
                            Calculate & Book Online <ArrowRight size={18} />
                        </Link>
                        <a href="tel:1800493769" className="btn-cta-outline">
                            Call Dispatch: 1800-HYDROX
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
