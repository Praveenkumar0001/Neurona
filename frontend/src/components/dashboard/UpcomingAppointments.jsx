import React from 'react';
import Card from '../common/Card';

const UpcomingAppointments = ({ appointments = [] }) => {
  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">Upcoming Appointments</h3>
      {appointments.length === 0 ? (
        <p className="text-center text-slate-600">No upcoming appointments</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{apt.doctorName || apt.patientName}</p>
                  <p className="text-sm text-slate-600">{apt.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(apt.date).toLocaleDateString()}</p>
                  <p className="text-sm text-blue-600">{apt.timeSlot}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export {
  UpcomingAppointments
};