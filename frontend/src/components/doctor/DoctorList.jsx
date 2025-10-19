import React, { useEffect, useState } from 'react';
import { useDoctors } from '../../hooks/useDoctors';
import DoctorCard from './DoctorCard';
import Loading from '../common/Loading';

const DoctorList = ({ filters = {} }) => {
  const { doctors, loading, fetchDoctors } = useDoctors();

  useEffect(() => {
    fetchDoctors(filters);
  }, [filters]);

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map(doctor => (
        <DoctorCard key={doctor._id} doctor={doctor} />
      ))}
    </div>
  );
};

export default DoctorList;