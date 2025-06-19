import React, { useState, useEffect } from 'react';
import { Hotel } from '../../types/hotel';
import { hotelService } from '../../services/hotelService';
import { useNavigate } from 'react-router-dom';

interface HotelFormProps {
  hotelToEdit?: Hotel;
}

const HotelForm: React.FC<HotelFormProps> = ({ hotelToEdit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    GlobalPropertyName: '',
    PropertyAddress1: '',
    PropertyCity: '',
    PropertyState: '',
    PropertyPostalCode: '',
    PropertyCountry: '',
    PropertyPhone: '',
    PropertyFax: '',
    PropertyLatitude: 0,
    PropertyLongitude: 0,
    HotelStars: 1,
    RoomsNumber: 0,
    FloorsNumber: 0,
    DistanceToTheAirport: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hotelToEdit) {
      setFormData({
        GlobalPropertyName: hotelToEdit.GlobalPropertyName || '',
        PropertyAddress1: hotelToEdit.PropertyAddress1 || '',
        PropertyCity: hotelToEdit.PropertyCity || '',
        PropertyState: hotelToEdit.PropertyState || '',
        PropertyPostalCode: hotelToEdit.PropertyPostalCode || '',
        PropertyCountry: hotelToEdit.PropertyCountry || '',
        PropertyPhone: hotelToEdit.PropertyPhone || '',
        PropertyFax: hotelToEdit.PropertyFax || '',
        PropertyLatitude: hotelToEdit.PropertyLatitude || 0,
        PropertyLongitude: hotelToEdit.PropertyLongitude || 0,
        HotelStars: hotelToEdit.HotelStars || 1,
        RoomsNumber: hotelToEdit.RoomsNumber || 0,
        FloorsNumber: hotelToEdit.FloorsNumber || 0,
        DistanceToTheAirport: hotelToEdit.DistanceToTheAirport || 0,
      });
    }
  }, [hotelToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (hotelToEdit?.GlobalPropertyID) {
        await hotelService.updateHotel(hotelToEdit.GlobalPropertyID, formData);
        alert('Hotel updated successfully!');
      } else {
        await hotelService.createHotel(formData as any);
        alert('Hotel created successfully!');
      }
      navigate('/dashboard/hotels');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hotel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">
          {hotelToEdit ? 'Edit Hotel' : 'Add New Hotel'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input
              type="text"
              name="GlobalPropertyName"
              value={formData.GlobalPropertyName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="PropertyAddress1"
              value={formData.PropertyAddress1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="PropertyCity"
              value={formData.PropertyCity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="PropertyState"
              value={formData.PropertyState}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              name="PropertyPostalCode"
              value={formData.PropertyPostalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="PropertyCountry"
              value={formData.PropertyCountry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="PropertyPhone"
              value={formData.PropertyPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Stars</label>
            <select
              name="HotelStars"
              value={formData.HotelStars}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3, 4, 5].map(star => (
                <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
            <input
              type="number"
              name="RoomsNumber"
              value={formData.RoomsNumber}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
            <input
              type="number"
              name="FloorsNumber"
              value={formData.FloorsNumber}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance to Airport (miles)</label>
            <input
              type="number"
              name="DistanceToTheAirport"
              value={formData.DistanceToTheAirport}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && (
            <div className="md:col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : (hotelToEdit ? 'Update Hotel' : 'Create Hotel')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/hotels')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelForm;
