import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Input from '../components/common/Input';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'booking', label: 'Booking', icon: '📅' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click on the Sign Up button on the landing page, fill in your details, and follow the verification process. You can sign up as either a patient or a doctor.',
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email to reset your password.',
    },
    {
      id: 3,
      category: 'booking',
      question: 'How do I book an appointment?',
      answer: 'Go to the Doctor Listing page, select a doctor, choose your preferred date and time, and complete the booking. You will receive a confirmation email.',
    },
    {
      id: 4,
      category: 'booking',
      question: 'Can I reschedule or cancel my appointment?',
      answer: 'Yes, you can cancel or reschedule up to 24 hours before your appointment from the "My Bookings" page.',
    },
    {
      id: 5,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, digital wallets, and bank transfers. All payments are secured with encryption.',
    },
    {
      id: 6,
      category: 'payments',
      question: 'Is there a cancellation fee?',
      answer: 'Cancellations made 24 hours before the appointment are free. Cancellations within 24 hours may incur a 50% fee.',
    },
    {
      id: 7,
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.',
    },
    {
      id: 8,
      category: 'technical',
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption (SSL/TLS) and comply with HIPAA regulations to protect your personal and medical data.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const articles = [
    {
      title: 'Getting Started with Neurona',
      category: 'account',
      readTime: '5 min',
      views: '1.2K',
    },
    {
      title: 'Understanding the AI Symptom Analysis',
      category: 'technical',
      readTime: '8 min',
      views: '2.1K',
    },
    {
      title: 'Complete Guide to Booking Appointments',
      category: 'booking',
      readTime: '6 min',
      views: '3.4K',
    },
    {
      title: 'Payment & Billing FAQ',
      category: 'payments',
      readTime: '4 min',
      views: '892',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-blue-100 mb-8">
            Find answers to your questions and get help quickly
          </p>
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white text-slate-900"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* FAQs */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map(faq => (
                    <Card key={faq.id} className="p-0 overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-semibold text-slate-900">{faq.question}</span>
                        <span className="text-2xl">
                          {expandedFaq === faq.id ? '−' : '+'}
                        </span>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-6 py-4 bg-slate-50 border-t">
                          <p className="text-slate-700">{faq.answer}</p>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-slate-600">No results found. Try a different search.</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Articles */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Popular Articles</h3>
                <div className="space-y-3">
                  {articles.map((article, idx) => (
                    <a key={idx} href="#" className="block hover:text-blue-600 transition-colors">
                      <p className="text-sm font-medium text-slate-900">{article.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {article.readTime} • {article.views} views
                      </p>
                    </a>
                  ))}
                </div>
              </Card>

              {/* Contact Support */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-lg font-bold mb-3">Still need help?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Can't find what you're looking for? Contact our support team.
                </p>
                <a href="/contact" className="text-blue-600 font-semibold text-sm">
                  Contact Support →
                </a>
              </Card>

              {/* Resources */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Resources</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  <a href="#" className="block text-sm text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  <a href="#" className="block text-sm text-blue-600 hover:underline">
                    Community Guidelines
                  </a>
                  <a href="#" className="block text-sm text-blue-600 hover:underline">
                    Blog
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="section-padding bg-white border-t">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">Video Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'How to Sign Up', duration: '3:45' },
              { title: 'Booking Your First Appointment', duration: '5:20' },
              { title: 'Using the Symptom Checker', duration: '4:15' },
              { title: 'Payment & Billing', duration: '3:30' },
            ].map((video, idx) => (
              <Card key={idx} className="overflow-hidden cursor-pointer hover:shadow-lg">
                <div className="bg-gradient-to-br from-blue-400 to-purple-400 h-40 flex-center text-white text-4xl">
                  ▶
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-slate-600">{video.duration}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;