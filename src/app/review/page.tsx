// app/review/page.tsx

"use client";

import { useState } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  image?: string;
  user: string;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      rating: 5,
      comment: "I’m in love with this product.",
      image: "https://via.placeholder.com/150",
      user: "User123",
    },
    {
      id: "2",
      rating: 4,
      comment: "Great product, but the battery could be better.",
      user: "User456",
    },
  ]);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    image: "",
  });

  const handleRatingChange = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReview({ ...newReview, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const review = {
      id: (reviews.length + 1).toString(),
      rating: newReview.rating,
      comment: newReview.comment,
      image: newReview.image,
      user: "CurrentUser",
    };
    setReviews([...reviews, review]);
    setNewReview({ rating: 0, comment: "", image: "" });
  };

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const ratingDistribution = {
    5: reviews.filter((review) => review.rating === 5).length,
    4: reviews.filter((review) => review.rating === 4).length,
    3: reviews.filter((review) => review.rating === 3).length,
    2: reviews.filter((review) => review.rating === 2).length,
    1: reviews.filter((review) => review.rating === 1).length,
  };

  return (
    <div className="w-full mx-auto p-6 min-h-screen bg-gray-100">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Product Reviews</h1>
        <p className="text-gray-600 mt-2">
          See what others are saying about this product and share your experience.
        </p>
      </div>

      {/* Average Rating Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {averageRating.toFixed(1)} ★
        </h2>
        <p className="text-gray-600">
          Based on {reviews.length} Ratings & Reviews
        </p>
      </div>

      {/* Star Distribution Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center mb-2">
            <span className="w-8">{star} ★</span>
            <div className="flex-1 bg-gray-200 h-2 rounded mx-2">
              <div
                className="bg-yellow-500 h-2 rounded"
                style={{
                  width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / reviews.length) * 100}%`,
                }}
              ></div>
            </div>
            <span>{ratingDistribution[star as keyof typeof ratingDistribution]}</span>
          </div>
        ))}
      </div>

      {/* Review List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        {reviews.map((review) => (
          <div key={review.id} className="mb-4 border-b pb-4">
            <div className="flex items-center">
              <span className="text-yellow-500 text-2xl">
                {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
              </span>
              <span className="ml-2 text-gray-600">{review.user}</span>
            </div>
            <p className="text-gray-800 mt-2">{review.comment}</p>
            {review.image && (
              <img
                src={review.image}
                alt="Review"
                className="mt-2 w-24 h-24 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>

      {/* Review Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingChange(star)}
                className={`text-2xl ${newReview.rating >= star ? "text-yellow-500" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Comment</label>
          <textarea
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            rows={4}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}