import React from 'react';
import Card from '../common/Card';

const RecentReports = ({ reports = [] }) => {
  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">Recent Reports</h3>
      {reports.length === 0 ? (
        <p className="text-center text-slate-600">No recent reports</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
              <p className="font-bold">Report #{report._id}</p>
              <p className="text-sm text-slate-600">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm">{report.symptoms?.length || 0} symptoms</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export {

  RecentReports
};