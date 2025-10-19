import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isPatient, isDoctor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Neurona</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              {isPatient && (
                <>
                  <Link to="/doctors" className="text-gray-700 hover:text-blue-600 font-medium">
                    Find Doctors
                  </Link>
                  <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 font-medium">
                    My Bookings
                  </Link>
                </>
              )}

              {isDoctor && (
                <Link to="/doctor/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
              )}

              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profile?.avatar || 'https://via.placeholder.com/40'}
                    alt={user?.profile?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user?.profile?.name}</span>
                </div>

                <div className="relative group">
                  <button className="p-2 text-gray-700 hover:text-blue-600">
                    <Settings className="w-5 h-5" />
                  </button>
                  <div className="hidden group-hover:block absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg z-50">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg">
                      <User className="w-4 h-4 inline mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-blue-600"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                {isPatient && (
                  <>
                    <Link to="/doctors" className="block text-gray-700 hover:text-blue-600 font-medium">
                      Find Doctors
                    </Link>
                    <Link to="/my-bookings" className="block text-gray-700 hover:text-blue-600 font-medium">
                      My Bookings
                    </Link>
                  </>
                )}
                {isDoctor && (
                  <Link to="/doctor/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                    Dashboard
                  </Link>
                )}
                <Link to="/profile" className="block text-gray-700 hover:text-blue-600 font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-700 hover:text-blue-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 font-medium">
                  Login
                </Link>
                <Link to="/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;