"use client";
import { useEffect, useState } from 'react';

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
    address: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      const [userRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/reviews?providerId=${userId}`)
      ]);
      
      const userData = await userRes.json();
      console.log("User data: ", userData); 
      setUser(userData);
      console.log("User data: ",userData);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Provider Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Personal Details</h2>
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
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
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
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Phone:</span> {user.phone}</p>
            <p><span className="font-medium">Address:</span> {user.address}</p>
        </div>
        )}
    </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <div className="mb-6 p-4 bg-yellow-50 rounded">
          <p className="text-2xl font-bold">
            Average Rating: {averageRating?.toFixed(1)} ★
          </p>
        </div>

        {reviews.map(review => (
          <div key={review._id} className="border-b py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500 text-lg">
                {'★'.repeat(review.rating)}
              </span>
              <span className="text-gray-600">by {review.charityId.name}</span>
            </div>
            <p className="text-gray-800">{review.comment}</p>
            <p className="text-sm text-gray-500 mt-2">
              For: {review.foodId.foodName}
            </p>
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
}