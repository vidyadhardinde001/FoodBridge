"use client";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  charityId: {
    name: string;
  };
  foodId: {
    foodName: string;
  };
  createdAt: string;
}

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  reviews: Review[];
  averageRating: number;
}

export default function ProviderProfileModal({ 
  providerId, 
  onClose 
}: { 
  providerId: string | null;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      const fetchProviderData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [userRes, reviewsRes] = await Promise.all([
            fetch(`/api/users/${providerId}`),
            fetch(`/api/reviews?providerId=${providerId}`)
          ]);
          
          if (!userRes.ok || !reviewsRes.ok) {
            throw new Error('Failed to fetch provider data');
          }

          const userData = await userRes.json();
          const reviewsData = await reviewsRes.json();
          
          setProvider({
            ...userData,
            reviews: reviewsData.reviews || [],
            averageRating: reviewsData.averageRating || 0
          });
        } catch (err) {
          console.error("Error fetching provider data:", err);
          setError('Failed to load provider information');
        } finally {
          setLoading(false);
        }
      };
      fetchProviderData();
    }
  }, [providerId]);

  return (
    <Dialog open={!!providerId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div className="text-center">
                <ArrowPathIcon className="h-8 w-8 mx-auto text-teal-600 animate-spin" />
                <p className="mt-2 text-gray-600">Loading provider details...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Provider Profile
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-200px)] px-6 py-4">
          {error ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                <ExclamationCircleIcon className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : provider ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Provider Header */}
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-full">
                  <UserCircleIcon className="h-10 w-10 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{provider.name}</h2>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(provider.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{provider.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{provider.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{provider.address}</p>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-4xl font-bold text-amber-800">
                      {provider.averageRating.toFixed(1)}
                      <span className="text-2xl text-amber-600">/5</span>
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      {provider.reviews.length} review{provider.reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round(provider.averageRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-amber-700">
                      {getRatingDescription(provider.averageRating)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                {provider.reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <StarIcon className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-gray-500">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {provider.reviews.map((review) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="flex mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {review.charityId.name}
                              </span>
                            </div>
                            <p className="text-gray-800 mb-2">{review.comment}</p>
                          </div>
                          <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 whitespace-nowrap">
                            {review.foodId.foodName}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getRatingDescription(rating: number): string {
  if (rating >= 4.5) return 'Exceptional Service';
  if (rating >= 4) return 'Excellent';
  if (rating >= 3.5) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Needs Improvement';
}