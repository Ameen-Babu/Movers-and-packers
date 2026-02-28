import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Truck, ArrowRight } from 'lucide-react';

const Booking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        movingDate: '',
        serviceType: 'local-move',
        weight: 10,
        estimatedPrice: 3000
    });
    const [distance, setDistance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState('');

    const baseRates = {
        'local-move': 3000,
        'intercity': 8000,
        'international': 50000,
        'office-shift': 12000,
        'house-shift': 12000
    };
    const calculatePrice = (dist, wt, type) => {
        const base = baseRates[type] || 3000;
        const distCost = dist * 18;
        const isPackage = type === 'house-shift' || type === 'office-shift';
        const weightCost = isPackage ? 0 : (wt * 5); // ₹5 per kg

        const subtotal = base + distCost + weightCost;
        const tax = subtotal * 0.05; // 5% GST
        return Math.round(subtotal + tax);
    };
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.pickupLocation.length >= 3 && formData.dropoffLocation.length >= 3) {
                const dist = await fetchDistance(formData.pickupLocation, formData.dropoffLocation);
                if (dist > 0) setDistance(dist);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData.pickupLocation, formData.dropoffLocation]);
    useEffect(() => {
        const newPrice = calculatePrice(distance, formData.weight, formData.serviceType);
        setFormData(prev => {
            
            if (prev.estimatedPrice !== newPrice) {
                return { ...prev, estimatedPrice: newPrice };
            }
            return prev;
        });
    }, [distance, formData.weight, formData.serviceType]);

    const fetchDistance = async (p1, p2) => {
        if (!p1 || !p2) return 0;
        try {
            setCalculating(true);
            const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

            if (!apiKey || apiKey === 'your_geoapify_api_key_here') {
                console.warn('Geoapify key missing or placeholder.');
                return 0;
            }


            const res1 = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(p1)}&apiKey=${apiKey}`);
            const data1 = await res1.json();
            const res2 = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(p2)}&apiKey=${apiKey}`);
            const data2 = await res2.json();

            if (!data1.features?.length || !data2.features?.length) {
                return 0;
            }

            const source = data1.features[0].geometry.coordinates;
            const target = data2.features[0].geometry.coordinates;


            const matrixRes = await fetch(`https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: "drive", sources: [{ location: source }], targets: [{ location: target }] })
            });
            const matrixData = await matrixRes.json();

            if (matrixData.sources_to_targets?.[0][0]) {
                const km = matrixData.sources_to_targets[0][0].distance / 1000;
                console.log(`Professional Distance: ${km} km`);
                return km;
            }
            return 0;
        } catch (err) {
            console.error('API Error:', err);
            return 0;
        } finally {
            setCalculating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newVal = name === 'estimatedPrice' || name === 'weight' ? Number(value) : value;

        setFormData(prev => ({ ...prev, [name]: newVal }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            setError('Please login first');
            setLoading(false);
            return;
        }

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!rzpKey || rzpKey === 'rzp_test_placeholder') {
                setError('CRITICAL: Razorpay Key ID missing in frontend/.env file! Please add it to enable real payments.');
                setLoading(false);
                return;
            }

            const bookingResponse = await fetch(`${apiBaseUrl}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (bookingResponse.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            const bookingData = await bookingResponse.json();
            if (!bookingResponse.ok) throw new Error(bookingData.message || 'Booking failed');

            const orderResponse = await fetch(`${apiBaseUrl}/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ requestId: bookingData._id })
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(orderData.message || 'Order creation failed');

            const options = {
                key: rzpKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Hydrox Movers',
                description: 'Moving Service Payment',
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${apiBaseUrl}/payments/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                requestId: bookingData._id
                            })
                        });

                        if (verifyRes.ok) {
                            navigate('/orders');
                        } else {
                            setError('Payment verification failed');
                        }
                    } catch (err) {
                        setError('Payment failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || '9999999999'
                },
                theme: { color: "#f7b733" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-page section-padding">
            <div className="container">
                <div className="section-header text-center">
                    <h2>Book Your <span className="highlight">Move</span></h2>
                    <p>Tell us about your requirements and get a professional team assigned.</p>
                </div>

                <div className="booking-container white-card p-50">
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label><MapPin size={16} /> PICKUP LOCATION</label>
                                <div className="input-wrapper">
                                    <input
                                        name="pickupLocation"
                                        type="text"
                                        placeholder="Enter full pickup address"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><MapPin size={16} /> DROPOFF LOCATION</label>
                                <div className="input-wrapper">
                                    <input
                                        name="dropoffLocation"
                                        type="text"
                                        placeholder="Enter full dropoff address"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> MOVING DATE</label>
                                <div className="input-wrapper">
                                    <input
                                        name="movingDate"
                                        type="date"
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Package size={16} /> SERVICE TYPE</label>
                                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="auth-select">
                                    <option value="local-move">Local Move</option>
                                    <option value="intercity">Intercity Move</option>
                                    <option value="international">International</option>
                                    <option value="house-shift">House Shifting</option>
                                    <option value="office-shift">Office Shifting</option>
                                </select>
                            </div>

                            {!(formData.serviceType === 'house-shift' || formData.serviceType === 'office-shift') && (
                                <div className="form-group">
                                    <label><Package size={16} /> WEIGHT (KG)</label>
                                    <div className="input-wrapper">
                                        <input
                                            name="weight"
                                            type="number"
                                            min="1"
                                            placeholder="Enter approximate weight in KG"
                                            value={formData.weight}
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="price-breakdown glass-card p-20 mt-30">
                            <div className="breakdown-row">
                                <span>Distance:</span>
                                <strong>{calculating ? 'Calculating...' : `${distance.toFixed(1)} km`}</strong>
                            </div>
                            {!(formData.serviceType === 'house-shift' || formData.serviceType === 'office-shift') && (
                                <div className="breakdown-row">
                                    <span>Consignment weight:</span>
                                    <strong>{formData.weight} kg</strong>
                                </div>
                            )}
                            <div className="breakdown-row">
                                <span>Base Rate + Fuel + Handling:</span>
                                <strong>₹{Math.round(formData.estimatedPrice / 1.05)}</strong>
                            </div>
                            <div className="breakdown-row highlight">
                                <span>GST (5%):</span>
                                <strong>₹{Math.round(formData.estimatedPrice * 0.05 / 1.05)}</strong>
                            </div>
                        </div>

                        {error && <div className="auth-error" style={{ marginTop: '20px' }}>{error}</div>}

                        <div className="booking-footer">
                            <div className="estimated-cost">
                                <span>Final Estimate:</span>
                                <h3>₹{formData.estimatedPrice.toLocaleString('en-IN')}</h3>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Booking...' : 'Confirm Booking'} <ArrowRight size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Booking;
