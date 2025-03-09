"use client";
import { useState, useEffect } from "react";
import { FaUser, FaWarehouse, FaHandsHelping, FaEdit, FaSave } from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState({
    organizationName: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    location: "",
    userType: "", // Donor or Charity
    availableSurplus: "", // For donors
    requiredItems: "", // For charities
    capacity: "", // Storage capacity for charities
    pastDonations: [],
    pastReceipts: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("foodCharityProfile");
    if (savedProfile) {
      setUserData(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    localStorage.setItem("foodCharityProfile", JSON.stringify(userData));
    setIsEditing(false);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-green-50 to-white shadow-xl rounded-lg mt-10 border border-gray-300">
      <h2 className="text-4xl font-extrabold text-green-700 mb-8 text-center">Profile</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" name="organizationName" placeholder="Organization Name" value={userData.organizationName} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
        <input type="text" name="contactPerson" placeholder="Contact Person" value={userData.contactPerson} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
        <input type="text" name="contactNumber" placeholder="Contact Number" value={userData.contactNumber} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
        <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
        <input type="text" name="location" placeholder="Location" value={userData.location} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
        <select name="userType" value={userData.userType} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing}>
          <option value="">Select User Type</option>
          <option value="Donor">Food Donor</option>
          <option value="Charity">Charity</option>
        </select>
        {userData.userType === "Donor" && (
          <textarea name="availableSurplus" placeholder="Available Surplus (e.g., Vegetables, Dairy)" value={userData.availableSurplus} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing}></textarea>
        )}
        {userData.userType === "Charity" && (
          <>
            <textarea name="requiredItems" placeholder="Required Food Items" value={userData.requiredItems} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing}></textarea>
            <input type="number" name="capacity" placeholder="Storage Capacity (kg)" value={userData.capacity} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 shadow-sm" disabled={!isEditing} />
          </>
        )}
      </form>
      <div className="mt-6 flex justify-center">
        {isEditing ? (
          <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition" onClick={handleSaveProfile}>
            <FaSave className="inline-block mr-2" /> Save Profile
          </button>
        ) : (
          <button className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition" onClick={handleEditProfile}>
            <FaEdit className="inline-block mr-2" /> Edit Profile
          </button>
        )}
      </div>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-700 flex items-center"><FaWarehouse className="mr-2" /> Past Donations</h3>
        <ul className="list-disc ml-6 mt-2">
          {userData.pastDonations.length > 0 ? userData.pastDonations.map((item, i) => (
            <li key={i} className="text-gray-600">{item}</li>
          )) : (
            <p className="text-gray-500">No donations yet.</p>
          )}
        </ul>
      </div>
      <div className="mt-6 p-6 bg-blue-100 rounded-lg shadow-md border border-blue-300">
        <h3 className="text-xl font-bold text-blue-700 flex items-center"><FaHandsHelping className="mr-2" /> Past Receipts</h3>
        <ul className="list-disc ml-6 mt-2">
          {userData.pastReceipts.length > 0 ? userData.pastReceipts.map((item, i) => (
            <li key={i} className="text-blue-600">{item}</li>
          )) : (
            <p className="text-gray-600">No received items yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
