"use client";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    // You can integrate EmailJS, Nodemailer, or backend endpoint here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 bg-white shadow-xl rounded-3xl p-10 border border-gray-100">
        
        {/* Left Side - Contact Info */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-green-600">Get in Touch</h2>
          <p className="text-gray-600">
            Whether you have a question, feedback, or partnership opportunity — we’d love to hear from you!
          </p>

          <div className="space-y-4 text-gray-700">
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-green-500 text-xl" />
              <span>contact@foodbridge.com</span>
            </div>
            <div className="flex items-center gap-4">
              <FaPhoneAlt className="text-green-500 text-xl" />
              <span>+1 (555) 987-6543</span>
            </div>
            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-green-500 text-xl" />
              <span>123 Green Ave, San Francisco, CA</span>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Response Time</h4>
            <p className="text-sm text-gray-600">We usually reply within 24 hours on business days.</p>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="bg-green-50 p-8 rounded-2xl shadow-inner border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white resize-none"
                placeholder="Type your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
