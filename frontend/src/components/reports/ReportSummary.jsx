import React from 'react';
import Card from '../common/Card';

const ReportSummary = ({ report }) => {
  return (
    <Card>
      <h3 className="font-bold text-lg mb-4">Report Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600">Total Reports:</span>
          <span className="font-bold">{report.totalReports || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Recent:</span>
          <span className="font-bold">{report.recentReports || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Active:</span>
          <span className="font-bold">{report.activeReports || 0}</span>
        </div>
      </div>
    </Card>
  );
};
export {
  ReportSummary
};