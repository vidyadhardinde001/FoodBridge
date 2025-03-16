"use client";
import { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaSave, FaCamera, FaTrash } from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState({
    organizationName: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    location: "",
    userType: "",
    profileImage: "",
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("foodCharityProfile");
    if (savedProfile) {
      setUserData(JSON.parse(savedProfile));
    }

    const savedOrders = localStorage.getItem("orderHistory");
    if (savedOrders) {
      setOrderHistory(JSON.parse(savedOrders));
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prevData) => ({ ...prevData, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-screen p-10 bg-gradient-to-r from-gray-900 to-gray-800 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-gray-900 p-8 shadow-2xl rounded-2xl text-white border border-gray-700 relative">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer">
            {userData.profileImage ? (
              <img src={userData.profileImage} alt="Profile" className="w-28 h-28 rounded-full border-4 border-gray-500 shadow-lg" />
            ) : (
              <FaUserCircle className="text-8xl text-gray-400" />
            )}
            {isEditing && (
    <>
      <div className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center w-10 h-10">
        <FaCamera className="text-white text-lg" />
      </div>
      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
    </>
  )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <h2 className="text-3xl font-bold mt-4 text-gray-200">{userData.contactPerson || "Your Name"}</h2>
          <p className="text-gray-400">{userData.userType || "Role"}</p>
          <p className="text-gray-500">{userData.location || "Location"}</p>
        </div>

        {/* Personal Information */}
        <div className="mt-8 bg-gray-800 p-6 shadow-md rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {[
              { label: "Organization Name", name: "organizationName" },
              { label: "Contact Person", name: "contactPerson" },
              { label: "Contact Number", name: "contactNumber" },
              { label: "Email", name: "email" },
              { label: "Location", name: "location" },
              { label: "User Type", name: "userType" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="text-gray-400 text-sm">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={userData[name]}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring focus:ring-blue-400"
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Order History Section */}
        <div className="mt-8 bg-gray-800 p-6 shadow-md rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2">Order History</h3>
          {orderHistory.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {orderHistory.map((order, index) => (
                <li key={index} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                  {order}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4">No previous orders found.</p>
          )}
        </div>

        {/* Edit, Save, and Delete Buttons */}
        <div className="mt-8 flex justify-between">
          {isEditing ? (
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition duration-300 shadow-lg" onClick={handleSaveProfile}>
              <FaSave className="inline-block mr-2" /> Save Profile
            </button>
          ) : (
            <button className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-400 transition duration-300 shadow-lg" onClick={handleEditProfile}>
              <FaEdit className="inline-block mr-2" /> Edit Profile
            </button>
          )}
          <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition duration-300 shadow-lg" onClick={() => window.confirm("Are you sure you want to delete your account?") && localStorage.clear()}>
            <FaTrash className="inline-block mr-2" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
