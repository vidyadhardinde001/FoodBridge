"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProviderProfileModal from '@/app/components/ProviderProfileModal';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  CheckIcon,
  PencilIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  StarIcon,
  PaperAirplaneIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Food {
  _id: string;
  foodName: string;
  provider: {
    _id: string;
    name: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  foodId: string;
}

export default function CharityProfile() {
  const [user, setUser] = useState<any>({});
  const [orders, setOrders] = useState<Food[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setEditedUser({
        organizationName: user.organizationName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${localStorage.getItem('userId')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedUser)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      const [userRes, ordersRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/food?charity=${userId}&status=picked_up`),
        fetch(`/api/reviews?charity=${userId}`)
      ]);

      const userData = await userRes.json();
      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();

      setUser(userData);
      setOrders(ordersData);

      // Ensure reviews is always an array
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || []);
    };
    fetchData();
  }, []);

    useEffect(() => {
      const fetchData = async () => {
        const userId = localStorage.getItem('userId');
        const [userRes, ordersRes, reviewsRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/food?charity=${userId}&status=charity_confirmed`),
          fetch(`/api/reviews?charity=${userId}`)
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();
        const reviewsData = await reviewsRes.json();

        setUser(userData);
        setOrders(ordersData);

        // Ensure reviews is always an array
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || []);
      };
      fetchData();
    }, []);

    const [isSubmittingReview, setIsSubmittingReview] = useState(false); // Renamed for clarity

  const submitReview = async (foodId: string) => {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      alert('Please select a rating between 1-5 stars');
      return;
    }

    // Validate comment
    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          foodId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Update UI optimistically
      setReviews([...reviews, data]);
      setShowReviewForm(null);
      setRating(0);
      setComment('');

      // Refresh data
      router.refresh();

      // Optional: Show toast notification instead of alert
      alert('Review submitted successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section with Animated Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">Charity Profile</h1>
                <p className="text-teal-100">Manage your organization details and food donations</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-md">
                <UserCircleIcon className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Organization Details Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Organization Details</h2>
              </div>
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${editMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                {editMode ? (
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
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text"
                      value={editedUser.organizationName}
                      onChange={(e) => setEditedUser({ ...editedUser, organizationName: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={editedUser.address}
                      onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
                      <BuildingOfficeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organization Name</p>
                      <p className="font-medium text-gray-900">{user.organizationName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <EnvelopeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                      <DevicePhoneMobileIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                      <MapPinIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{user.address}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Confirmed Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Confirmed Orders</h2>
                <p className="text-gray-500 text-sm">Your recent food Deliveries</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300">
                  <ShoppingBagIcon className="h-full w-full" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-700">No orders yet</h3>
                <p className="mt-1 text-gray-500">Your confirmed food donations will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md ${showReviewForm === order._id ? 'border-teal-300 bg-teal-50' : 'border-gray-200'
                      }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                              <ShoppingBagIcon className="h-6 w-6" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{order.foodName}</h3>
                            <p className="mt-1 flex items-center text-sm text-gray-500">
                              <UserIcon className="h-4 w-4 mr-1" />
                              Provider: {order.provider?.name || 'Not assigned'}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {!reviews.find(r => r.foodId === order._id) ? (
                          <button
                            onClick={() => setShowReviewForm(order._id)}
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:shadow-md transition-all flex items-center space-x-2"
                          >
                            <StarIcon className="h-4 w-4" />
                            <span>Add Review</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700">
                            <CheckIcon className="h-4 w-4 mr-1" />
                            <span>Reviewed</span>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {showReviewForm === order._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-800">Share Your Feedback</h4>
                                <button
                                  onClick={() => setShowReviewForm(null)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                  aria-label="Close review form"
                                >
                                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                              </div>

                              <div className="space-y-5">
                                {/* Rating Section */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How would you rate this donation?
                                  </label>
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                      {[1, 2, 3, 4, 5].map((num) => (
                                        <motion.button
                                          key={num}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => setRating(num)}
                                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${rating >= num
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            } ${num > 1 ? 'ml-2' : ''}`}
                                          aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
                                        >
                                          <StarIcon
                                            className={`h-6 w-6 ${rating >= num ? 'fill-current' : ''}`}
                                          />
                                        </motion.button>
                                      ))}
                                    </div>
                                    <motion.span
                                      key={rating}
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-sm font-medium text-gray-600 min-w-[80px]"
                                    >
                                      {rating === 1 && 'Poor'}
                                      {rating === 2 && 'Fair'}
                                      {rating === 3 && 'Good'}
                                      {rating === 4 && 'Very Good'}
                                      {rating === 5 && 'Excellent'}
                                    </motion.span>
                                  </div>
                                </div>

                                {/* Comment Section */}
                                <div>
                                  <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                                    Share your experience
                                  </label>
                                  <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                                    placeholder="What did you appreciate about this donation? How could it be improved?"
                                    rows={4}
                                    aria-describedby="comment-help"
                                  />
                                  <p id="comment-help" className="mt-1 text-sm text-gray-500">
                                    Your feedback helps improve the donation experience
                                  </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowReviewForm(null)}
                                    className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-gray-700 font-medium"
                                  >
                                    Cancel
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => submitReview(order._id)}
                                    disabled={!rating || isLoading}
                                    className={`px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all ${!rating || isLoading
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-md'
                                      }`}
                                  >
                                    {isLoading ? (
                                      <>
                                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                        <span>Submitting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                        <span>Submit Review</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Provider Profile Modal */}
      <AnimatePresence>
        {selectedProviderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <ProviderProfileModal
                providerId={selectedProviderId}
                onClose={() => setSelectedProviderId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}