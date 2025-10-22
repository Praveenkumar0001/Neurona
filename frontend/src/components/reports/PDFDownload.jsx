import React from 'react';
import Button from '../common/Button';

const PDFDownload = ({ reportId, reportName }) => {
  const handleDownload = () => {
    // Implementation for downloading PDF
    window.open(`/api/reports/${reportId}/download`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
      <span className="text-3xl">📄</span>
      <div className="flex-1">
        <h4 className="font-bold">{reportName}</h4>
        <p className="text-sm text-slate-600">Click to download PDF</p>
      </div>
      <Button variant="primary" onClick={handleDownload}>
        Download
      </Button>
    </div>
  );
};

export {
  PDFDownload
};