import React, { useState } from 'react';
import { MEDICAL_SPECIALIZATIONS } from '../../utils/constants';

const DoctorFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: '',
    maxFee: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilter(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold">Filter Doctors</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Specialization</label>
        <select
          name="specialization"
          value={filters.specialization}
          onChange={handleChange}
          className="input-base"
        >
          <option value="">All Specializations</option>
          {MEDICAL_SPECIALIZATIONS.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Minimum Rating</label>
        <select
          name="minRating"
          value={filters.minRating}
          onChange={handleChange}
          className="input-base"
        >
          <option value="">All Ratings</option>
          <option value="4">⭐ 4.0+</option>
          <option value="4.5">⭐ 4.5+</option>
          <option value="5">⭐ 5.0</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Fee</label>
        <input
          type="number"
          name="maxFee"
          value={filters.maxFee}
          onChange={handleChange}
          placeholder="$500"
          className="input-base"
        />
      </div>

      <button
        onClick={handleApply}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default DoctorFilter;