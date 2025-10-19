import React, { useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const team = [
    { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', img: '👨‍⚕️' },
    { name: 'John Smith', role: 'Tech Lead', img: '👨‍💻' },
    { name: 'Dr. Emily Brown', role: 'Head of Research', img: '👩‍🔬' },
    { name: 'Michael Chen', role: 'Product Manager', img: '📊' },
  ];

  const values = [
    { title: 'Patient-Centric', desc: 'We prioritize patient needs above all else' },
    { title: 'Innovation', desc: 'Leveraging AI to improve healthcare outcomes' },
    { title: 'Accessibility', desc: 'Making quality healthcare accessible to everyone' },
    { title: 'Trust', desc: 'Building trust through transparency and security' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">About Neurona</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Revolutionizing healthcare through technology and compassion
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                At Neurona, we believe that quality healthcare should be accessible to everyone, everywhere. 
                Our mission is to bridge the gap between patients and healthcare providers through intelligent 
                technology and compassionate care.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                We're committed to making healthcare more efficient, affordable, and personal.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 h-96 flex-center">
              <span className="text-9xl">🏥</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="text-center">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-slate-600">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-center text-slate-600 mb-16 text-lg">
            Experienced professionals dedicated to your health
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg cursor-pointer">
                <div className="text-6xl mb-4">{member.img}</div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-slate-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="space-y-8">
            {[
              { year: '2022', title: 'Founded', desc: 'Neurona was established with a vision to transform healthcare' },
              { year: '2023', title: 'Launch', desc: 'Successfully launched MVP with 50+ partner doctors' },
              { year: '2024', title: 'Growth', desc: 'Expanded to 5000+ users and 150+ doctors' },
              { year: '2025', title: 'Innovation', desc: 'Introducing advanced AI-powered symptom analysis' },
            ].map((milestone, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex-center font-bold">
                    {idx + 1}
                  </div>
                  {idx < 3 && <div className="w-1 h-16 bg-blue-200 mt-2"></div>}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</h3>
                  <h4 className="text-xl font-semibold mb-2">{milestone.title}</h4>
                  <p className="text-slate-600">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { stat: '150+', label: 'Doctors' },
              { stat: '5000+', label: 'Patients' },
              { stat: '12,500+', label: 'Appointments' },
              { stat: '98%', label: 'Satisfaction' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold mb-2">{item.stat}</div>
                <p className="text-blue-100">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;