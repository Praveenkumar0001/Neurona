import React from 'react';
import Card from '../common/Card';

const DoctorStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="text-2xl font-bold">{stats.totalPatients || 0}</h3>
          <p className="text-slate-600">Total Patients</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">📅</div>
          <h3 className="text-2xl font-bold">{stats.todayAppointments || 0}</h3>
          <p className="text-slate-600">Today's Appointments</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="text-2xl font-bold">{stats.rating?.toFixed(1) || 0}</h3>
          <p className="text-slate-600">Rating</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="text-2xl font-bold">${stats.earnings || 0}</h3>
          <p className="text-slate-600">This Month</p>
        </div>
      </Card>
    </div>
  );
};
export {
  
  DoctorStats
};