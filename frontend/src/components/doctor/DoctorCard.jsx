import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="card-hover">
      <div className="flex gap-4">
        <Avatar name={doctor.name} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-bold">{doctor.name}</h3>
          <p className="text-sm text-slate-600">{doctor.specialization}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">{doctor.rating.toFixed(1)}</span>
            <span className="text-slate-600">({doctor.totalReviews} reviews)</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">{doctor.yearsOfExperience} years experience</p>
          <p className="text-lg font-bold text-blue-600 mt-2">${doctor.consultationFee}</p>
        </div>
      </div>
      <Link to={`/booking/${doctor._id}`} className="mt-4 block">
        <Button variant="primary" fullWidth>
          Book Appointment
        </Button>
      </Link>
    </div>
  );
};

export default DoctorCard;