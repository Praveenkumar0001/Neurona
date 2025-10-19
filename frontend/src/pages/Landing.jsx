import { useNavigate } from 'react-router-dom';
import { UserCircle, Stethoscope, ArrowRight, Heart, Zap, Shield, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Your Mental Health Matters
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              AI-Powered Mental Health Platform
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Connect with expert psychiatrists and therapists from the comfort of your home
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Patient Card */}
            <div
              onClick={() => navigate('/signup?role=patient')}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:border-blue-500 border-2 border-transparent transition-all cursor-pointer"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
                Join as Patient
              </h2>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-600">AI-powered symptom assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-600">Book appointments with verified doctors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-600">Secure and confidential consultations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-600">Track your mental health journey</span>
                </li>
              </ul>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/signup?role=patient')}
              >
                Get Started as Patient
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Doctor Card */}
            <div
              onClick={() => navigate('/signup?role=doctor')}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:border-green-500 border-2 border-transparent transition-all cursor-pointer"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
                Join as Doctor
              </h2>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">Manage your consultation schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">Access patient symptom reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">Secure consultation platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-600">Grow your practice online</span>
                </li>
              </ul>

              <Button
                variant="primary"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/signup?role=doctor')}
              >
                Get Started as Doctor
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
              Why Choose Neurona?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">AI-Powered Assessment</h3>
                <p className="text-gray-600">
                  Get instant preliminary mental health assessment using advanced AI technology
                </p>
              </div>

              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">100% Confidential</h3>
                <p className="text-gray-600">
                  Your privacy is our priority. All sessions are completely confidential
                </p>
              </div>

              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Expert Professionals</h3>
                <p className="text-gray-600">
                  Connect with verified psychiatrists and therapists with years of experience
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 opacity-90">
              Take the first step towards better mental health today
            </p>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => navigate('/signup')}
            >
              Get Started Now
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;