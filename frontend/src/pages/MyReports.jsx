import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Trash2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { symptomService } from '../services/symptomService';
import { reportService } from '../services/reportService';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await symptomService.getMyReports(page, 10);
      setReports(result.reports);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      toast.error('Error fetching reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (reportId, fileName) => {
    try {
      const blob = await reportService.downloadReportPDF(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Error downloading report');
      console.error(error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await symptomService.deleteReport(reportId);
      toast.success('Report deleted');
      fetchReports();
    } catch (error) {
      toast.error('Error deleting report');
      console.error(error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading your reports..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <Button onClick={() => navigate('/symptom-intake')}>
            New Assessment
          </Button>
        </div>

        {reports.length > 0 ? (
          <>
            <div className="space-y-6">
              {reports.map((report) => (
                <Card key={report._id} className="hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-5 gap-4 mb-4">
                    {/* Date */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Score */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Overall Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {report.analysis.overallScore}/30
                      </p>
                    </div>

                    {/* Severity */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Severity</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(report.analysis.severity)} capitalize`}>
                        {report.analysis.severity}
                      </span>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Recommendation</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {report.analysis.recommendation}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Status</p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {report.analysis.summary}
                  </p>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 flex gap-3 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/my-reports/${report._id}`)}
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadPDF(report._id, `report-${report._id}.pdf`)}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/doctors')}
                    >
                      <Share2 className="w-4 h-4" />
                      Share with Doctor
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No reports yet</p>
            <Button onClick={() => navigate('/symptom-intake')}>
              Start Your First Assessment
            </Button>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyReports;