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
      navigate('/hotels');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hotel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {hotelToEdit ? 'Edit Hotel' : 'Add New Hotel'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
          <input
            type="text"
            name="GlobalPropertyName"
            value={formData.GlobalPropertyName}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="PropertyAddress1"
            value={formData.PropertyAddress1}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hotel Stars</label>
          <select
            name="HotelStars"
            value={formData.HotelStars}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {[1, 2, 3, 4, 5].map(star => (
              <option key={star} value={star}>
                {star} Star{star > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Rooms</label>
            <input
              type="number"
              name="RoomsNumber"
              value={formData.RoomsNumber}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Floors</label>
            <input
              type="number"
              name="FloorsNumber"
              value={formData.FloorsNumber}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Distance to Airport (miles)</label>
            <input
              type="number"
              name="DistanceToTheAirport"
              value={formData.DistanceToTheAirport}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : (hotelToEdit ? 'Update Hotel' : 'Create Hotel')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/hotels')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelForm;
