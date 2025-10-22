
import React, { useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import ReportCard from './ReportCard';
import Loading from '../common/Loading';

const ReportList = () => {
  const { reports, loading, fetchReports, downloadReport } = useReports();

  useEffect(() => {
    fetchReports();
  }, []);

  const handleView = (id) => {
    window.location.href = `/reports/${id}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Reports</h2>
      {reports.length === 0 ? (
        <p className="text-center text-slate-600">No reports found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => (
            <ReportCard
              key={report._id}
              report={report}
              onView={handleView}
              onDownload={downloadReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export {
  ReportList
};