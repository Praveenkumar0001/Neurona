import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Toast from '../components/common/Toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setToast({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.',
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      details: 'support@neurona.health',
      action: 'mailto:support@neurona.health'
    },
    {
      icon: '📞',
      title: 'Phone',
      details: '+1 (555) 123-4567',
      action: 'tel:+15551234567'
    },
    {
      icon: '📍',
      title: 'Address',
      details: '123 Health Street, Medical City, MC 12345',
      action: '#'
    },
    {
      icon: '🕐',
      title: 'Hours',
      details: 'Mon - Fri: 9AM - 6PM (EST)',
      action: '#'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message anytime.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, idx) => (
              <a key={idx} href={info.action} className="no-underline">
                <Card className="text-center hover:shadow-lg cursor-pointer">
                  <div className="text-5xl mb-4">{info.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <p className="text-slate-600">{info.details}</p>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Message subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    rows="6"
                    required
                    className="input-base"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Why Contact Us?</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>✓ Technical support</li>
                    <li>✓ Billing inquiries</li>
                    <li>✓ Feature requests</li>
                    <li>✓ Partnership opportunities</li>
                    <li>✓ General feedback</li>
                  </ul>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4">Response Time</h3>
                  <p className="text-slate-600 mb-3">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                  <div className="flex gap-4">
                    {['f', 't', 'in', 'ig'].map((social, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex-center hover:bg-blue-700"
                      >
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'How do I book an appointment?',
                a: 'Visit our doctor listing page, select your preferred doctor, and follow the booking process.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, we use industry-standard encryption and comply with HIPAA regulations to protect your data.'
              },
              {
                q: 'Can I cancel or reschedule?',
                a: 'Yes, you can cancel or reschedule up to 24 hours before your appointment.'
              },
              {
                q: 'Do you offer emergency services?',
                a: 'For emergencies, please call 911 or visit your nearest emergency room.'
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Contact;