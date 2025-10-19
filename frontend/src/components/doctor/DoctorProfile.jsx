import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDoctors } from '../../hooks/useDoctors';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Loading from '../common/Loading';

const DoctorProfile = () => {
  const { id } = useParams();
  const { getDoctorById, loading } = useDoctors();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const data = await getDoctorById(id);
      setDoctor(data);
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <Loading />;
  if (!doctor) return <p>Doctor not found</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex gap-6">
        <Avatar name={doctor.name} size="xl" />
        <div>
          <h1 className="text-4xl font-bold">{doctor.name}</h1>
          <p className="text-xl text-slate-600 mt-2">{doctor.specialization}</p>
          <div className="flex gap-4 mt-4">
            <Badge variant="primary">{doctor.yearsOfExperience} years experience</Badge>
            <Badge variant="success">⭐ {doctor.rating.toFixed(1)}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="text-lg font-bold mb-2">Qualifications</h3>
          <ul className="space-y-1">
            {doctor.qualifications?.map((qual, idx) => (
              <li key={idx} className="text-slate-600">✓ {qual}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-2">About</h3>
          <p className="text-slate-600">{doctor.bio}</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="font-bold">Consultation Fee: <span className="text-2xl text-blue-600">${doctor.consultationFee}</span></p>
      </div>
    </div>
  );
};

export default DoctorProfile;