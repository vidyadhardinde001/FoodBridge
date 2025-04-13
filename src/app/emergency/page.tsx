"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmergencySubmission {
  id: string;
  name: string;
  location: string;
  foodType: string;
  quantity: string;
  contact: string;
  additionalInfo: string;
  timestamp: Date;
  isAvailable: boolean;
  dateAvailable: string;
  type: "emergency";
}

interface PublicAnnouncement {
  id: string;
  name: string;
  location: string;
  message: string;
  isAvailable: boolean;
  timestamp: Date;
  dateAvailable: string;
  type: "announcement";
}

export default function EmergencyPage() {
  // Emergency Report Form State
  const [emergencyFormData, setEmergencyFormData] = useState({
    name: "",
    location: "",
    foodType: "",
    quantity: "",
    contact: "",
    additionalInfo: "",
    isAvailable: true,
    dateAvailable: "",
  });

  // Announcement Form State
  const [announcementFormData, setAnnouncementFormData] = useState({
    name: "",
    location: "",
    message: "",
    isAvailable: true,
    dateAvailable: "",
  });

  const [emergencySubmissions, setEmergencySubmissions] = useState<EmergencySubmission[]>([]);
  const [publicAnnouncements, setPublicAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [activeTab, setActiveTab] = useState<"emergency" | "announcements">("emergency");
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmergencyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnnouncementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: EmergencySubmission = {
      id: Date.now().toString(),
      ...emergencyFormData,
      timestamp: new Date(),
      type: "emergency"
    };
    
    setEmergencySubmissions([newSubmission, ...emergencySubmissions]);
    setEmergencyFormData({
      name: "",
      location: "",
      foodType: "",
      quantity: "",
      contact: "",
      additionalInfo: "",
      isAvailable: true,
      dateAvailable: "",
    });
    setShowEmergencyForm(false);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: PublicAnnouncement = {
      id: Date.now().toString(),
      ...announcementFormData,
      timestamp: new Date(),
      type: "announcement"
    };
    
    setPublicAnnouncements([newAnnouncement, ...publicAnnouncements]);
    setAnnouncementFormData({
      name: "",
      location: "",
      message: "",
      isAvailable: true,
      dateAvailable: "",
    });
    setShowAnnouncementForm(false);
    setShowNotification(true);
  };

  // Delete functions
  const deleteEmergencyReport = (id: string) => {
    setEmergencySubmissions(emergencySubmissions.filter(report => report.id !== id));
  };

  const deleteAnnouncement = (id: string) => {
    setPublicAnnouncements(publicAnnouncements.filter(announcement => announcement.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-red-300 relative"
        >
          {/* Notification Bell */}
          {showNotification && publicAnnouncements.length > 0 && activeTab !== "announcements" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 cursor-pointer"
              onClick={() => setActiveTab("announcements")}
              whileHover={{ scale: 1.1 }}
            >
              <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {publicAnnouncements.length}
                </span>
              </div>
            </motion.div>
          )}

          <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
            🚨 Food Availability Portal
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Report emergency food supplies or share public announcements about food availability
          </p>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeTab === "emergency" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("emergency")}
            >
              Emergency Reports
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === "announcements" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"}`}
              onClick={() => {
                setActiveTab("announcements");
                setShowNotification(false);
              }}
            >
              Public Announcements
            </button>
          </div>

          {/* Emergency Report Form */}
          {activeTab === "emergency" && (
            <>
              <AnimatePresence>
                {showEmergencyForm && (
                  <motion.form
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleEmergencySubmit}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      name="name"
                      value={emergencyFormData.name}
                      onChange={handleEmergencyChange}
                      placeholder="Your Name"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <input
                      type="text"
                      name="location"
                      value={emergencyFormData.location}
                      onChange={handleEmergencyChange}
                      placeholder="Location (City/Area)"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex gap-4">
                      <input
                        type="text"
                        name="foodType"
                        value={emergencyFormData.foodType}
                        onChange={handleEmergencyChange}
                        placeholder="Type of Food"
                        required
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <input
                        type="text"
                        name="quantity"
                        value={emergencyFormData.quantity}
                        onChange={handleEmergencyChange}
                        placeholder="Quantity"
                        required
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    <input
                      type="text"
                      name="contact"
                      value={emergencyFormData.contact}
                      onChange={handleEmergencyChange}
                      placeholder="Contact Number"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={emergencyFormData.isAvailable}
                        onChange={(e) => setEmergencyFormData({...emergencyFormData, isAvailable: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="isAvailable">Food is currently available</label>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="dateAvailable" className="block text-sm font-medium text-gray-700 mb-1">
                          Date Available Until
                        </label>
                        <input
                          type="date"
                          id="dateAvailable"
                          name="dateAvailable"
                          value={emergencyFormData.dateAvailable}
                          onChange={handleEmergencyChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                    </div>

                    <textarea
                      name="additionalInfo"
                      value={emergencyFormData.additionalInfo}
                      onChange={handleEmergencyChange}
                      placeholder="Any additional information (optional)"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
                      >
                        Submit Report 🚨
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmergencyForm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {!showEmergencyForm && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowEmergencyForm(true)}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
                >
                  + Add Emergency Food Report
                </motion.button>
              )}
            </>
          )}

          {/* Announcement Form */}
          {activeTab === "announcements" && (
            <>
              <AnimatePresence>
                {showAnnouncementForm && (
                  <motion.form
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleAnnouncementSubmit}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      name="name"
                      value={announcementFormData.name}
                      onChange={handleAnnouncementChange}
                      placeholder="Your Name (optional)"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <input
                      type="text"
                      name="location"
                      value={announcementFormData.location}
                      onChange={handleAnnouncementChange}
                      placeholder="Location (City/Area)"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="announcementAvailable"
                        name="isAvailable"
                        checked={announcementFormData.isAvailable}
                        onChange={(e) => setAnnouncementFormData({...announcementFormData, isAvailable: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="announcementAvailable">
                        {announcementFormData.isAvailable ? "Food is available" : "Food is not available"}
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="announcementDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Date Available Until
                        </label>
                        <input
                          type="date"
                          id="announcementDate"
                          name="dateAvailable"
                          value={announcementFormData.dateAvailable}
                          onChange={handleAnnouncementChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                    </div>

                    <textarea
                      name="message"
                      value={announcementFormData.message}
                      onChange={handleAnnouncementChange}
                      placeholder="Your announcement message"
                      rows={4}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                      >
                        Post Announcement 📢
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAnnouncementForm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {!showAnnouncementForm && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowAnnouncementForm(true)}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                >
                  + Add Public Announcement
                </motion.button>
              )}
            </>
          )}
        </motion.div>

        {/* Content Display Area */}
        {activeTab === "emergency" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {emergencySubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white border rounded-xl shadow-md overflow-hidden ${
                    submission.isAvailable ? "border-green-300" : "border-red-300"
                  }`}
                >
                  <div className={`p-4 text-white ${
                    submission.isAvailable ? "bg-green-600" : "bg-red-600"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{submission.foodType}</h3>
                        <p className="text-sm opacity-90">{submission.location}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEmergencyReport(submission.id);
                        }}
                        className="text-white hover:text-gray-200"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Quantity:</span>
                      <span>{submission.quantity}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Contact:</span>
                      <span>{submission.contact}</span>
                    </div>
                    {submission.additionalInfo && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          {submission.additionalInfo}
                        </p>
                      </div>
                    )}
                    {submission.dateAvailable && (
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Available Until:</span>
                        <span>{new Date(submission.dateAvailable).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="mt-4 text-xs text-gray-500">
                      Reported at: {submission.timestamp.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {emergencySubmissions.length === 0 && !showEmergencyForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 text-gray-500"
              >
                <p className="text-lg">No emergency reports yet</p>
                <button
                  onClick={() => setShowEmergencyForm(true)}
                  className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition"
                >
                  Create First Report
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {publicAnnouncements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white border rounded-xl shadow-md overflow-hidden ${
                    announcement.isAvailable ? "border-green-300" : "border-red-300"
                  }`}
                >
                  <div className={`p-4 text-white ${
                    announcement.isAvailable ? "bg-green-600" : "bg-red-600"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{announcement.location}</h3>
                        {announcement.name && (
                          <p className="text-sm opacity-90">Posted by: {announcement.name}</p>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnouncement(announcement.id);
                        }}
                        className="text-white hover:text-gray-200"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2 text-yellow-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" 
                        />
                      </svg>
                      <span className="font-medium">Public Announcement</span>
                    </div>
                    <p className="mb-4">{announcement.message}</p>
                    {announcement.dateAvailable && (
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Available Until:</span>
                        <span>{new Date(announcement.dateAvailable).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Posted at: {announcement.timestamp.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {publicAnnouncements.length === 0 && !showAnnouncementForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 text-gray-500"
              >
                <p className="text-lg">No public announcements yet</p>
                <button
                  onClick={() => setShowAnnouncementForm(true)}
                  className="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition"
                >
                  Create First Announcement
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}