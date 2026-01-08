// book service
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Truck, ArrowRight } from 'lucide-react';

const Booking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        movingDate: '',
        serviceType: 'local-move',
        estimatedPrice: 3000
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const priceMap = {
        'local-move': 3000,
        'intercity': 12000,
        'international': 75000,
        'office-shift': 8500
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'serviceType') {
            setFormData({
                ...formData,
                serviceType: value,
                estimatedPrice: priceMap[value] || 3000
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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
                            navigate('/dashboard');
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
                                <select name="serviceType" onChange={handleChange} className="auth-select">
                                    <option value="local-move">Local Move</option>
                                    <option value="intercity">Intercity Move</option>
                                    <option value="international">International</option>
                                    <option value="office-shift">Office Shifting</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="auth-error" style={{ marginTop: '20px' }}>{error}</div>}

                        <div className="booking-footer">
                            <div className="estimated-cost">
                                <span>Estimated Price:</span>
                                <h3>₹{formData.estimatedPrice}</h3>
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
