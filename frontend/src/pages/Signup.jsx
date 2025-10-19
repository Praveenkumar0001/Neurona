import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    role: role
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData(prev => ({ ...prev, role: newRole }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit number';
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = validateStep1();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const newErrors = validateStep2();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const signupData = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        role: role
      };

      const result = await signup(signupData);

      if (result.success) {
        toast.success('Account created successfully!');
        const user = result.user;
        if (user.role === 'patient') {
          navigate('/patient/dashboard');
        } else if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        }
      } else {
        toast.error(result.error || 'Signup failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">Neurona</span>
          </div>
          <p className="text-gray-600">Create Your Account</p>
        </div>

        {/* Role Selection */}
        {step === 1 && (
          <div className="mb-6 space-y-3">
            <label className="text-sm font-medium text-gray-700">Select Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'patient'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-sm">Patient</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('doctor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'doctor'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">👨‍⚕️</div>
                <div className="font-medium text-sm">Doctor</div>
              </button>
            </div>
          </div>
        )}

        {/* Signup Card */}
        <Card className="border border-gray-200">
          <form onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit} className="space-y-6">
            {step === 1 ? (
              <>
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />

                <Button type="submit" variant="primary" className="w-full">
                  Next
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                    disabled={loading}
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </Card>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-gray-600">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;