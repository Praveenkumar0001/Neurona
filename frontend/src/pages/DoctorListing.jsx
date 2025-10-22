import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { doctorService } from '../services/doctorService';
import { useNavigate } from 'react-router-dom';

const DoctorListing = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    search: '',
    minFee: '',
    maxFee: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const filterObj = {};
      
      if (filters.specialty) filterObj.specialty = filters.specialty;
      if (filters.search) filterObj.search = filters.search;
      if (filters.minFee) filterObj.minFee = filters.minFee;
      if (filters.maxFee) filterObj.maxFee = filters.maxFee;

      const result = await doctorService.getAllDoctors(
        pagination.page,
        pagination.limit,
        filterObj
      );

      setDoctors(result.data);
      setPagination(prev => ({ ...prev, total: result.pagination.totalItems }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Finding doctors for you..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
          <p className="text-lg text-gray-600">Connect with expert psychiatrists and therapists</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <select
              name="specialty"
              value={filters.specialty}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialties</option>
              <option value="psychiatrist">Psychiatrist</option>
              <option value="therapist">Therapist</option>
              <option value="counselor">Counselor</option>
              <option value="psychologist">Psychologist</option>
            </select>

            <input
              type="number"
              name="minFee"
              placeholder="Min Fee"
              value={filters.minFee}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              name="maxFee"
              placeholder="Max Fee"
              value={filters.maxFee}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              variant="secondary"
              onClick={() => setFilters({ specialty: '', search: '', minFee: '', maxFee: '' })}
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {doctors.map((doctor) => (
                <Card key={doctor._id} className="flex flex-col hover:shadow-xl transition-shadow">
                  {/* Doctor Image */}
                  <img
                    src={doctor.profileImage || 'https://via.placeholder.com/300x200'}
                    alt={doctor.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />

                  {/* Doctor Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. {doctor.name}</h3>
                  <p className="text-blue-600 font-medium capitalize mb-2">{doctor.specialty}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(doctor.rating) ? 'fill-yellow-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {doctor.rating} ({doctor.totalRatings} reviews)
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p>🎓 {doctor.qualification}</p>
                    <p>👔 {doctor.experience} years experience</p>
                    <p className="font-medium text-gray-900">₹{doctor.fee} per session</p>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 flex-1">{doctor.bio}</p>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages?.map((lang) => (
                        <span key={lang} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(`/booking/${doctor._id}`)}
                  >
                    Book Appointment
                  </Button>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <Button
                variant="secondary"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-700 font-medium">
                Page {pagination.page}
              </span>
              <Button
                variant="secondary"
                disabled={pagination.page >= Math.ceil((pagination.total || 0) / pagination.limit)}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No doctors found matching your criteria</p>
            <Button onClick={() => setFilters({ specialty: '', search: '', minFee: '', maxFee: '' })}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DoctorListing;