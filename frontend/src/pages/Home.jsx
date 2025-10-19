import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    doctors: 150,
    patients: 5000,
    appointments: 12500,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInLeft">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Health, Our Priority
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Connect with expert doctors, get symptom analysis, and book appointments all in one place.
              </p>
              <div className="flex gap-4 flex-wrap">
                {user ? (
                  <>
                    <Link to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'}>
                      <Button variant="primary" size="lg">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button variant="primary" size="lg">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="animate-fadeInRight">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex-center">
                      <span className="text-2xl">🩺</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Expert Doctors</h3>
                      <p className="text-blue-100">Verified medical professionals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Instant Booking</h3>
                      <p className="text-blue-100">Schedule appointments easily</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Chatbot</h3>
                      <p className="text-blue-100">Symptom analysis & guidance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Doctors', value: stats.doctors, icon: '👨‍⚕️' },
              { label: 'Patients', value: stats.patients, icon: '👥' },
              { label: 'Appointments', value: stats.appointments, icon: '📅' },
            ].map((stat, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg">
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value.toLocaleString()}+</div>
                <p className="text-slate-600">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
            Simple steps to get the healthcare you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Sign Up', desc: 'Create your account in seconds' },
              { num: '2', title: 'Describe Symptoms', desc: 'Tell us about your symptoms' },
              { num: '3', title: 'Get Analysis', desc: 'AI provides initial assessment' },
              { num: '4', title: 'Book Doctor', desc: 'Connect with verified doctors' },
            ].map((step, idx) => (
              <Card key={idx} className="relative">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex-center font-bold text-xl mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-blue-100">
            Join thousands of satisfied patients who trust Neurona for their healthcare needs.
          </p>
          {!user && (
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;