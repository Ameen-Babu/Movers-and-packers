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
        estimatedPrice: 500
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            setError('Please login to book a service');
            setLoading(false);
            return;
        }

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const data = await response.json();
                setError(data.message || 'Booking failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
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

                <div className="booking-container glass-card">
                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label><MapPin size={16} /> PICKUP LOCATION</label>
                                <input
                                    name="pickupLocation"
                                    type="text"
                                    placeholder="Enter full pickup address"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label><MapPin size={16} /> DROPOFF LOCATION</label>
                                <input
                                    name="dropoffLocation"
                                    type="text"
                                    placeholder="Enter full dropoff address"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label><Calendar size={16} /> MOVING DATE</label>
                                <input
                                    name="movingDate"
                                    type="date"
                                    required
                                    onChange={handleChange}
                                />
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
                                <h3>${formData.estimatedPrice}</h3>
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
