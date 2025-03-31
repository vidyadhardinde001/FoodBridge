"use client";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

export default function ProviderProfileModal({ providerId, onClose }: { 
  providerId: string | null;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (providerId) {
      const fetchProviderData = async () => {
        setLoading(true);
        try {
          const [userRes, reviewsRes] = await Promise.all([
            fetch(`/api/users/${providerId}`),
            fetch(`/api/reviews?providerId=${providerId}`)
          ]);
          
          const userData = await userRes.json();
          const reviewsData = await reviewsRes.json();
          
          setProvider({
            ...userData,
            reviews: reviewsData.reviews,
            averageRating: reviewsData.averageRating
          });
        } catch (error) {
          console.error("Error fetching provider data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProviderData();
    }
  }, [providerId]);

  return (
    <Dialog open={!!providerId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Provider Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : provider ? (
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold">{provider.name}</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{provider.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-800">{provider.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-800">{provider.address}</p>
                </div>
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  {provider.averageRating?.toFixed(1)} ★
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Based on {provider.reviews.length} reviews
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${
                          star <= Math.round(provider.averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Recent Reviews</h4>
              {provider.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No reviews yet
                </p>
              ) : (
                provider.reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 text-lg">
                        {'★'.repeat(review.rating)}
                      </span>
                      <span className="text-gray-600">
                        by {review.charityId.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      For: {review.foodId.foodName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">Provider not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}