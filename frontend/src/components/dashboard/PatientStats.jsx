import React from 'react';
import Card from '../common/Card';

const PatientStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">📅</div>
          <h3 className="text-2xl font-bold">{stats.totalAppointments || 0}</h3>
          <p className="text-slate-600">Total Appointments</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-2xl font-bold">{stats.completedAppointments || 0}</h3>
          <p className="text-slate-600">Completed</p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <div className="text-4xl mb-2">📄</div>
          <h3 className="text-2xl font-bold">{stats.symptomReports || 0}</h3>
          <p className="text-slate-600">Reports</p>
        </div>
      </Card>
    </div>
  );
};
export {
  PatientStats
};