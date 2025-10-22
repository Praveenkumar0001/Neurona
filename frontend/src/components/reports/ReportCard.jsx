import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const ReportCard = ({ report, onView, onDownload }) => {
  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Medical Report</h3>
          <p className="text-sm text-slate-600">Report ID: {report._id}</p>
        </div>
        <Badge variant="success">✓ Completed</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm">📅 {new Date(report.createdAt).toLocaleDateString()}</p>
        <p className="text-sm">👨‍⚕️ Dr. {report.doctorName}</p>
        <p className="text-sm">📄 {report.symptoms?.length || 0} symptoms reported</p>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={() => onView(report._id)}>
          View Report
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onDownload(report._id)}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};
export {
  ReportCard
};