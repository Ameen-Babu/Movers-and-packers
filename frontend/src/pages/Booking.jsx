import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, MapPin, Calendar, Truck, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Info, Calculator } from 'lucide-react';

const SERVICE_OPTIONS = [
    { id: '1bhk', label: '1 BHK Apartment Move', baseRate: 4500, perKm: 16 },
    { id: '2bhk', label: '2-3 BHK House Move', baseRate: 7800, perKm: 22 },
    { id: 'villa', label: 'Large Villa / 4+ BHK', baseRate: 12500, perKm: 28 },
    { id: 'office', label: 'Commercial / Office Shift', baseRate: 14000, perKm: 30 },
    { id: 'single', label: 'Single Furniture / Fragile Only', baseRate: 2500, perKm: 12 }
];

const Booking = () => {
    const navigate = useNavigate();
    const locationState = useLocation().state || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        pickupLocation: locationState.pickupLocation || '',
        dropoffLocation: locationState.dropoffLocation || '',
        movingDate: locationState.movingDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        serviceType: locationState.serviceType || '2bhk',
        weight: 150,
        packingTier: 'premium', 
        insuranceCover: 'full', 
        elevatorPickup: true,
        elevatorDropoff: true,
        specialInstructions: ''
    });

    const [distance, setDistance] = useState(0);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState(null);

    
    const selectedService = SERVICE_OPTIONS.find(s => s.id === formData.serviceType) || SERVICE_OPTIONS[1];
    
    
    useEffect(() => {
        const p1 = (formData.pickupLocation || '').trim();
        const p2 = (formData.dropoffLocation || '').trim();

        if (!p1 || !p2) {
            setDistance(0);
            return;
        }

        if (p1.toLowerCase() === p2.toLowerCase()) {
            setDistance(15);
            return;
        }

        let isMounted = true;
        const timer = setTimeout(async () => {
            setIsCalculatingDistance(true);

            try {
                const geoKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
                
                
                if (geoKey) {
                    const geoRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(p1)}&apiKey=${geoKey}`);
                    const geoData = await geoRes.json();
                    const destRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(p2)}&apiKey=${geoKey}`);
                    const destData = await destRes.json();

                    if (geoData.features?.[0] && destData.features?.[0]) {
                        const [lon1, lat1] = geoData.features[0].geometry.coordinates;
                        const [lon2, lat2] = destData.features[0].geometry.coordinates;
                        const routeRes = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${lat1},${lon1}|${lat2},${lon2}&mode=drive&apiKey=${geoKey}`);
                        const routeData = await routeRes.json();
                        
                        if (routeData.features?.[0]?.properties?.distance && isMounted) {
                            setDistance(Math.round(routeData.features[0].properties.distance / 1000));
                            setIsCalculatingDistance(false);
                            return;
                        }
                    }
                }

                
                const pRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(p1)}`);
                const pData = await pRes.json();
                const dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(p2)}`);
                const dData = await dRes.json();

                if (pData?.[0] && dData?.[0]) {
                    const lat1 = pData[0].lat;
                    const lon1 = pData[0].lon;
                    const lat2 = dData[0].lat;
                    const lon2 = dData[0].lon;

                    const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
                    const osrmData = await osrmRes.json();

                    if (osrmData.routes?.[0]?.distance && isMounted) {
                        const km = Math.round(osrmData.routes[0].distance / 1000);
                        setDistance(km);
                        setIsCalculatingDistance(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn('GPS Routing fallback triggered:', err);
            }

            
            if (!isMounted) return;
            const pair1 = `${p1.toLowerCase()}-${p2.toLowerCase()}`;
            const matrix = {
                'kochi-bangalore': 540, 'kochi-trivandrum': 210, 'kochi-calicut': 190,
                'kochi-kozhikode': 190, 'kochi-malappuram': 165, 'kochi-kottakkal': 150,
                'malappuram-kochi': 165, 'malappuram-kozhikode': 50, 'malappuram-bangalore': 360,
                'kottakkal-kochi': 150, 'kottakkal-kozhikode': 45, 'bangalore-chennai': 340
            };
            
            let fallbackKm = 320;
            Object.keys(matrix).forEach(key => {
                const [c1, c2] = key.split('-');
                if (p1.toLowerCase().includes(c1) && p2.toLowerCase().includes(c2)) fallbackKm = matrix[key];
                else if (p1.toLowerCase().includes(c2) && p2.toLowerCase().includes(c1)) fallbackKm = matrix[key];
            });

            setDistance(fallbackKm);
            setIsCalculatingDistance(false);
        }, 600);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [formData.pickupLocation, formData.dropoffLocation]);

    const baseCost = selectedService.baseRate;
    const distanceCost = distance * selectedService.perKm;
    const packingCost = formData.packingTier === 'premium' ? 2500 : (formData.packingTier === 'crate' ? 4500 : 1200);
    const insuranceCost = formData.insuranceCover === 'full' ? 1800 : 500;
    const totalEstimate = Math.round(baseCost + distanceCost + packingCost + insuranceCost);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!formData.pickupLocation || !formData.dropoffLocation || !formData.movingDate) {
                setError('Please fill in pickup, destination, and moving date.');
                return;
            }
        }
        setError('');
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const handlePrevStep = () => {
        setError('');
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const storedUserStr = localStorage.getItem('user');
        const userData = storedUserStr ? JSON.parse(storedUserStr) : null;
        const token = userData?.token || localStorage.getItem('token');

        if (!userData || !token) {
            setError('Please login to finalize your relocation booking.');
            setLoading(false);
            setTimeout(() => {
                navigate('/login', { state: { from: '/booking' } });
            }, 1500);
            return;
        }

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pickupLocation: formData.pickupLocation,
                    dropoffLocation: formData.dropoffLocation,
                    movingDate: formData.movingDate,
                    serviceType: selectedService.label,
                    weight: Number(formData.weight),
                    estimatedPrice: totalEstimate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit booking request');
            }

            setSuccessOrder(data);
        } catch (err) {
            console.error('Booking submission error:', err);
            setError(err.message || 'Server connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (successOrder) {
        return (
            <div className="booking-page section-padding">
                <div className="container max-w-700">
                    <div className="booking-success-card">
                        <div className="success-icon-badge">
                            <CheckCircle2 size={54} />
                        </div>
                        <h2>Relocation Booking Confirmed!</h2>
                        <p className="success-subtext">Order Reference: <strong>#{successOrder._id?.slice(-8).toUpperCase() || 'HYD-8829'}</strong></p>
                        
                        <div className="success-summary-box">
                            <div className="summary-row">
                                <span>Service Type:</span>
                                <strong>{successOrder.serviceType}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Pickup Location:</span>
                                <strong>{successOrder.pickupLocation}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Destination:</span>
                                <strong>{successOrder.dropoffLocation}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Scheduled Date:</span>
                                <strong>{new Date(successOrder.movingDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</strong>
                            </div>
                            <div className="summary-row highlight">
                                <span>Total Guaranteed Fare:</span>
                                <strong>₹{successOrder.estimatedPrice?.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>

                        <p className="dispatch-note">
                            <Info size={16} /> Our logistics dispatch manager will call you within 2 hours to confirm vehicle assignment and packing crew details.
                        </p>

                        <div className="success-actions">
                            <button className="btn-primary" onClick={() => navigate('/orders')}>
                                View My Relocations <Truck size={18} />
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page section-padding bg-slate-subtle">
            <div className="container">
                <div className="section-head text-center">
                    <span className="sub-title">GUARANTEED TRANSPARENT PRICING</span>
                    <h2>Schedule Your Relocation</h2>
                    <p className="head-desc">Complete the details below to lock in your binding fare estimate with full insurance coverage.</p>
                </div>

                <div className="booking-steps-bar">
                    <div className={`step-pill ${currentStep === 1 ? 'active' : (currentStep > 1 ? 'completed' : '')}`}>
                        <span className="step-num">{currentStep > 1 ? '✓' : '1'}</span>
                        <span className="step-label">Route & Schedule</span>
                    </div>
                    <div className={`step-pill ${currentStep === 2 ? 'active' : (currentStep > 2 ? 'completed' : '')}`}>
                        <span className="step-num">{currentStep > 2 ? '✓' : '2'}</span>
                        <span className="step-label">Scale & Cargo</span>
                    </div>
                    <div className={`step-pill ${currentStep === 3 ? 'active' : (currentStep > 3 ? 'completed' : '')}`}>
                        <span className="step-num">{currentStep > 3 ? '✓' : '3'}</span>
                        <span className="step-label">Packing & Protection</span>
                    </div>
                    <div className={`step-pill ${currentStep === 4 ? 'active' : (currentStep > 4 ? 'completed' : '')}`}>
                        <span className="step-num">4</span>
                        <span className="step-label">Review & Confirm</span>
                    </div>
                </div>

                {error && (
                    <div className="booking-alert-box">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="booking-grid-layout">
                    {/* Form Section */}
                    <div className="booking-form-card">
                        {currentStep === 1 && (
                            <div className="form-step-content">
                                <h3>Step 1: Origin, Destination & Preferred Date</h3>
                                <p className="step-subhead">Enter address or city details for accurate transit mileage calculation.</p>

                                <div className="form-group-block">
                                    <label>Pickup Address / City</label>
                                    <input 
                                        type="text" 
                                        name="pickupLocation" 
                                        value={formData.pickupLocation} 
                                        onChange={handleChange}
                                        placeholder="e.g. Edappally, Kochi, Kerala"
                                        required 
                                    />
                                </div>

                                <div className="form-group-block">
                                    <label>Destination Address / City</label>
                                    <input 
                                        type="text" 
                                        name="dropoffLocation" 
                                        value={formData.dropoffLocation} 
                                        onChange={handleChange}
                                        placeholder="e.g. Indiranagar, Bangalore, Karnataka"
                                        required 
                                    />
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group-block">
                                        <label>Moving Date</label>
                                        <input 
                                            type="date" 
                                            name="movingDate" 
                                            value={formData.movingDate} 
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group-block">
                                        <label>Estimated Mileage</label>
                                        <input 
                                            type="text" 
                                            value={isCalculatingDistance ? 'Calculating GPS driving distance...' : (distance > 0 ? `~${distance} km driving route` : 'Enter pickup & destination cities')} 
                                            disabled 
                                            className="input-disabled"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="form-step-content">
                                <h3>Step 2: Relocation Scale & Item Profile</h3>
                                <p className="step-subhead">Select your property size to assign the appropriate vehicle and crew capacity.</p>

                                <div className="form-group-block">
                                    <label><Package size={16} /> Select Relocation Category</label>
                                    <div className="service-radio-grid">
                                        {SERVICE_OPTIONS.map(service => (
                                            <label 
                                                key={service.id} 
                                                className={`radio-card ${formData.serviceType === service.id ? 'selected' : ''}`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="serviceType" 
                                                    value={service.id} 
                                                    checked={formData.serviceType === service.id}
                                                    onChange={handleChange}
                                                />
                                                <div className="radio-text">
                                                    <strong>{service.label}</strong>
                                                    <span>Base dispatch: ₹{service.baseRate.toLocaleString('en-IN')}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group-block">
                                        <label>Approximate Total Weight (kg)</label>
                                        <input 
                                            type="number" 
                                            name="weight" 
                                            value={formData.weight} 
                                            onChange={handleChange}
                                            min="20"
                                            max="5000" 
                                        />
                                    </div>
                                    <div className="form-group-block">
                                        <label>Special Fragile Cargo (e.g. Piano, TV)</label>
                                        <input 
                                            type="text" 
                                            name="specialInstructions" 
                                            value={formData.specialInstructions} 
                                            onChange={handleChange}
                                            placeholder="Optional details" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="form-step-content">
                                <h3>Step 3: Professional Packaging & Insurance Grade</h3>
                                <p className="step-subhead">Choose your protective material specifications and cargo coverage.</p>

                                <div className="form-group-block">
                                    <label><ShieldCheck size={16} /> Packaging Tier</label>
                                    <div className="tier-options-grid">
                                        <label className={`tier-card ${formData.packingTier === 'standard' ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="packingTier" 
                                                value="standard" 
                                                checked={formData.packingTier === 'standard'}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <strong>Standard Packaging (+₹1,200)</strong>
                                                <p>Corrugated boxes, stretch film, and furniture blankets.</p>
                                            </div>
                                        </label>

                                        <label className={`tier-card ${formData.packingTier === 'premium' ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="packingTier" 
                                                value="premium" 
                                                checked={formData.packingTier === 'premium'}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <strong>Premium Multi-Layer (+₹2,500)</strong>
                                                <p>5-layer heavy boxes, bubble wrap, mattress covers, & edge guards.</p>
                                            </div>
                                        </label>

                                        <label className={`tier-card ${formData.packingTier === 'crate' ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="packingTier" 
                                                value="crate" 
                                                checked={formData.packingTier === 'crate'}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <strong>Custom Wooden Crating (+₹4,500)</strong>
                                                <p>Reinforced wooden crate building for high-value artwork & electronics.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group-block">
                                    <label><ShieldCheck size={16} /> Transit Valuation & Insurance</label>
                                    <div className="form-row-2">
                                        <label className={`radio-card ${formData.insuranceCover === 'basic' ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="insuranceCover" 
                                                value="basic" 
                                                checked={formData.insuranceCover === 'basic'}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <strong>Basic Carrier Liability (+₹500)</strong>
                                                <span>Standard road damage coverage</span>
                                            </div>
                                        </label>
                                        <label className={`radio-card ${formData.insuranceCover === 'full' ? 'selected' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="insuranceCover" 
                                                value="full" 
                                                checked={formData.insuranceCover === 'full'}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <strong>Full Comprehensive Cover (+₹1,800)</strong>
                                                <span>Complete replacement guarantee</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="form-step-content">
                                <h3>Step 4: Final Contract Review & Authorization</h3>
                                <p className="step-subhead">Verify your details prior to locking in dispatch schedule.</p>

                                <div className="review-details-table">
                                    <div className="table-row">
                                        <span>Route:</span>
                                        <strong>{formData.pickupLocation} → {formData.dropoffLocation}</strong>
                                    </div>
                                    <div className="table-row">
                                        <span>Moving Date:</span>
                                        <strong>{new Date(formData.movingDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
                                    </div>
                                    <div className="table-row">
                                        <span>Relocation Class:</span>
                                        <strong>{selectedService.label}</strong>
                                    </div>
                                    <div className="table-row">
                                        <span>Packaging Specification:</span>
                                        <strong style={{ textTransform: 'capitalize' }}>{formData.packingTier} Grade</strong>
                                    </div>
                                    <div className="table-row">
                                        <span>Transit Insurance:</span>
                                        <strong style={{ textTransform: 'capitalize' }}>{formData.insuranceCover} Cover</strong>
                                    </div>
                                </div>

                                <div className="terms-agreement-box">
                                    <p><ShieldCheck size={16} /> By confirming, Hydrox Movers guarantees this binding fare. No hidden fees or extra surcharges will be demanded at destination.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Control Buttons */}
                        <div className="form-step-nav-bar">
                            {currentStep > 1 && (
                                <button type="button" className="btn-step-prev" onClick={handlePrevStep}>
                                    Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button type="button" className="btn-step-next" onClick={handleNextStep}>
                                    Continue to Step {currentStep + 1} <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    className="btn-step-submit" 
                                    onClick={handleSubmitBooking}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing Booking...' : 'Confirm & Schedule Relocation'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Fare Summary Column */}
                    <div className="booking-summary-card">
                        <div className="summary-card-header">
                            <Calculator size={20} />
                            <h4>Fare Breakdown</h4>
                        </div>

                        <div className="summary-items-list">
                            <div className="summary-item">
                                <span>Base Dispatch Fare</span>
                                <strong>₹{baseCost.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Highway Transit (~{distance} km)</span>
                                <strong>₹{distanceCost.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Packaging Material ({formData.packingTier})</span>
                                <strong>₹{packingCost.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Insurance & Cargo Warranty</span>
                                <strong>₹{insuranceCost.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>

                        <div className="summary-total-box">
                            <span className="total-label">Total Guaranteed Price</span>
                            <strong className="total-price">₹{totalEstimate.toLocaleString('en-IN')}</strong>
                            <span className="tax-inclusive">Includes GST & Toll Charges</span>
                        </div>

                        <div className="summary-guarantee-list">
                            <p><CheckCircle2 size={14} /> Fixed Price Contract</p>
                            <p><CheckCircle2 size={14} /> Professional Uniformed Crew</p>
                            <p><CheckCircle2 size={14} /> Real-Time Fleet Tracking</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
