import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="container-custom text-center">
          <div className="mb-8 animate-fadeInUp">
            <div className="text-9xl mb-4">🔒</div>
            <h1 className="text-6xl font-bold text-slate-900 mb-4">403</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-4">
              Access Denied
            </h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-8">
              You don't have permission to access this resource. 
              Please contact an administrator if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/">
              <Button variant="primary" size="lg">
                Go to Home
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-slate-600">
              <strong>Error Code:</strong> UNAUTHORIZED_ACCESS
            </p>
            <p className="text-sm text-slate-600 mt-2">
              If you need assistance, please reach out to our support team.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Unauthorized;