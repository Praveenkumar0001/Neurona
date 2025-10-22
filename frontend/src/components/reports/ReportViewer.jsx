import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import Loading from '../common/Loading';
import Button from '../common/Button';

const ReportViewer = () => {
  const { id } = useParams();
  const { getReportById, downloadReport } = useReports();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(id);
        setReport(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <Loading />;
  if (!report) return <p>Report not found</p>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Medical Report</h1>
          <p className="text-slate-600">Report ID: {report._id}</p>
        </div>
        <Button variant="primary" onClick={() => downloadReport(id)}>
          Download PDF
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg">Patient Information</h3>
          <p>Name: {report.patientName}</p>
          <p>Date: {new Date(report.createdAt).toLocaleDateString()}</p>
        </div>

        <div>
          <h3 className="font-bold text-lg">Symptoms</h3>
          <ul className="list-disc ml-5">
            {report.symptoms?.map((symptom, idx) => (
              <li key={idx}>{symptom}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg">Analysis</h3>
          <p>{report.aiAnalysis?.recommendations?.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

export {
  ReportViewer
};