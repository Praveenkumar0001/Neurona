import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    pincode: user?.profile?.pincode || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <Card>
          {/* Avatar Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <img
                src={user?.profile?.avatar || 'https://via.placeholder.com/100'}
                alt={user?.profile?.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <Button variant="secondary" size="sm">
                <Camera className="w-4 h-4" />
                Change Avatar
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={user?.email}
                disabled
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={user?.phone}
                disabled
              />

              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <Input
              label="Address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <Input
                label="City"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
              />

              <Input
                label="State"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
              />

              <Input
                label="Pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/patient/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Section */}
        <Card className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
          <Button variant="secondary" onClick={() => navigate('/change-password')}>
            Change Password
          </Button>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;