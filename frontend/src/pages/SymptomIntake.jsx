import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { symptomService } from '../services/symptomService';

const questions = [
  {
    id: 1,
    question: "Hi! I'm here to help understand how you're feeling. What's your name?",
    type: "text",
    field: "name"
  },
  {
    id: 2,
    question: "How would you describe your mood recently?",
    type: "options",
    field: "mood",
    options: ["happy", "neutral", "sad", "anxious", "depressed", "hopeless"]
  },
  {
    id: 3,
    question: "On a scale of 1-5, how would you rate your energy levels?",
    type: "scale",
    field: "energy",
    min: 1,
    max: 5
  },
  {
    id: 4,
    question: "How has your sleep been?",
    type: "options",
    field: "sleep",
    options: ["good", "fair", "poor", "insomnia"]
  },
  {
    id: 5,
    question: "On a scale of 1-5, how anxious do you feel?",
    type: "scale",
    field: "anxiety",
    min: 1,
    max: 5
  },
  {
    id: 6,
    question: "How's your appetite?",
    type: "options",
    field: "appetite",
    options: ["normal", "increased", "decreased", "no appetite"]
  },
  {
    id: 7,
    question: "How's your concentration?",
    type: "options",
    field: "concentration",
    options: ["not at all", "sometimes", "often", "always"]
  },
  {
    id: 8,
    question: "Are you experiencing social withdrawal?",
    type: "options",
    field: "socialWithdrawal",
    options: ["no", "sometimes", "often", "yes"]
  },
  {
    id: 9,
    question: "For how long have you been experiencing these symptoms?",
    type: "options",
    field: "duration",
    options: ["less than 2 weeks", "2-4 weeks", "1-3 months", "3-6 months", "more than 6 months"]
  },
  {
    id: 10,
    question: "Have you received treatment for mental health before?",
    type: "options",
    field: "previousTreatment",
    options: ["yes", "no"]
  }
];

const SymptomIntake = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState(null);

  const handleResponse = (value) => {
    const field = questions[currentQuestion].field;
    setResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await symptomService.submitSymptoms(responses);
      
      if (result.success) {
        setReport(result.report);
        setSubmitted(true);
        toast.success('Assessment completed! Your report is ready.');
      }
    } catch (error) {
      toast.error('Error submitting assessment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setResponses({});
    setSubmitted(false);
    setReport(null);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (submitted && report) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
          <Card className="border-2 border-green-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
              <p className="text-gray-600">Your mental health assessment has been analyzed</p>
            </div>

            {/* Report Results */}
            <div className="space-y-6 mb-8">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Results</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Overall Score</p>
                    <p className="text-4xl font-bold text-blue-600">{report.analysis.overallScore}/30</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Severity Level</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${
                        report.analysis.severity === 'mild' ? 'bg-green-500' :
                        report.analysis.severity === 'moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{report.analysis.severity}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">Recommended Specialist</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {report.analysis.recommendation}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {report.analysis.summary}
                </p>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                <ul className="space-y-2">
                  {report.analysis.suggestedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/doctors')}
              >
                Find a Specialist
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleReset}
                >
                  New Assessment
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/my-reports')}
                >
                  View Report
                </Button>
              </div>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <Card>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQ.question}</h2>

            {/* Response Options */}
            {currentQ.type === 'text' && (
              <input
                type="text"
                placeholder="Type your answer..."
                value={responses[currentQ.field] || ''}
                onChange={(e) => handleResponse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {currentQ.type === 'options' && (
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleResponse(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      responses[currentQ.field] === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900 capitalize">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'scale' && (
              <div className="flex justify-between gap-3">
                {Array.from({ length: currentQ.max - currentQ.min + 1 }, (_, i) => currentQ.min + i).map((num) => (
                  <button
                    key={num}
                    onClick={() => handleResponse(num)}
                    className={`flex-1 py-4 rounded-lg border-2 transition-all font-semibold text-lg ${
                      responses[currentQ.field] === num
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                <Send className="w-4 h-4" />
                Submit Assessment
              </Button>
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleNext}
              >
                Next</Button>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SymptomIntake;