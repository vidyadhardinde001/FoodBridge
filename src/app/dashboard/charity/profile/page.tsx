"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProviderProfileModal from '@/app/components/ProviderProfileModal';

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

  const submitReview = async (foodId: string) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ foodId, rating, comment })
    });

    if (res.ok) {
      setShowReviewForm(null);
      router.refresh();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Charity Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Organization Details</h2>
        <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
            {editMode ? 'Save Changes' : 'Edit'}
        </button>
        </div>
        {editMode ? (
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input
                type="text"
                value={editedUser.organizationName}
                onChange={(e) => setEditedUser({...editedUser, organizationName: e.target.value})}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
                type="tel"
                value={editedUser.phone}
                onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
                value={editedUser.address}
                onChange={(e) => setEditedUser({...editedUser, address: e.target.value})}
                className="w-full p-2 border rounded"
            />
            </div>
        </div>
        ) : (
        <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.organizationName}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Phone:</span> {user.phone}</p>
            <p><span className="font-medium">Address:</span> {user.address}</p>
        </div>
        )}
    </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmed Orders</h2>
        {orders.map(order => (
          <div key={order._id} className="border-b py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{order.foodName}</h3>
                <p className="text-gray-600 cursor-pointer hover:underline" 
                onClick={() => order.provider?._id && setSelectedProviderId(order.provider._id)}>Provider: {order.provider.name}</p>
              </div>
              {!reviews.find(r => r.foodId === order._id) ? (
                <button
                  onClick={() => setShowReviewForm(order._id)}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  Add Review
                </button>
              ) : (
                <span className="text-gray-500">Reviewed ✓</span>
              )}
            </div>

            {showReviewForm === order._id && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setRating(num)}
                      className={`w-10 h-10 rounded-full ${rating >= num ? 'bg-yellow-400' : 'bg-gray-200'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  placeholder="Write your review..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitReview(order._id)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Submit Review
                  </button>
                  <button
                    onClick={() => setShowReviewForm(null)}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <ProviderProfileModal 
              providerId={selectedProviderId}
              onClose={() => setSelectedProviderId(null)}
            />
    </div>
  );
}