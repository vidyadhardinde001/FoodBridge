// dashboard/provider/profile.tsx

"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  CheckIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  foodId: {
    foodName: string;
  };
  charityId: {
    name: string;
  };
  createdAt: string;
}

export default function ProviderProfile() {
  const [user, setUser] = useState<any>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    phone: '',
    fssai: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const userId = localStorage.getItem('userId');
        const [userRes, reviewsRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/reviews?providerId=${userId}`)
        ]);
        
        if (!userRes.ok || !reviewsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const userData = await userRes.json();
        const reviewsData = await reviewsRes.json();
        
        setUser(userData);
        setReviews(reviewsData.reviews);
        setAverageRating(reviewsData.averageRating);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        fssai: user.fssai || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${localStorage.getItem('userId')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedUser)
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-teal-600 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">Error Loading Profile</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Provider Profile</h1>
                <p className="text-teal-100 opacity-90">Manage your account and view reviews</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-md">
                  <UserCircleIcon className="h-10 w-10 text-white" />
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full">
                  <span className="font-medium">ID: {localStorage.getItem('userId')?.slice(-6)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                <p className="text-gray-500 text-sm mt-1">Your account information</p>
              </div>
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                disabled={isLoading}
                className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  editMode
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : editMode ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            {editMode ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Fssai No.</label>
                    <input
                      type="text"
                      value={editedUser.fssai}
                      onChange={(e) => setEditedUser({...editedUser, fssai: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="your fssai no."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={editedUser.address}
                      onChange={(e) => setEditedUser({...editedUser, address: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Your full address"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-600 mt-1">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{user.name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mt-1">
                      <EnvelopeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email || 'Not provided'}</p>
                    </div>
                    
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mt-1">
                      <EnvelopeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">FSSAI No.</p>
                      <p className="font-medium text-gray-900">{user.fssai || 'Not provided'}</p>
                    </div>
                    
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600 mt-1">
                      <PhoneIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-amber-100 rounded-lg text-amber-600 mt-1">
                      <MapPinIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{user.address || 'Not provided'}</p>
                    </div>
                    
                  </div>
                  
                </div>
                
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Customer Reviews</h2>
                <p className="text-gray-500 text-sm mt-1">Feedback from charities you've served</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <StarIcon className="h-6 w-6" />
                    <span className="text-2xl font-bold">{averageRating?.toFixed(1)}</span>
                    <span className="text-amber-100">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300">
                  <StarIcon className="h-full w-full" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-700">No reviews yet</h3>
                <p className="mt-1 text-gray-500">Your reviews will appear here once charities rate your donations</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">{review.charityId.name}</h3>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                      <div className="bg-gray-50 px-3 py-1 rounded-full text-sm text-gray-600 flex items-center">
                        <span>{review.foodId.foodName}</span>
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}