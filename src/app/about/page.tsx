import { FaUsers, FaLinkedin, FaEnvelope, FaPhone, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Vidyadhar Dinde",
      image: "/team/john.jpg",
      contact: {
        email: "john@foodbridge.com",
        phone: "+1 (555) 123-4567",
        linkedin: "https://linkedin.com/in/johndoe",
      },
      expertise: ["Food Industry", "Operations", "Business Strategy"]
    },
    {
      id: 2,
      name: "Aditya Khandare",
      image: "/team/jane.jpg",
      contact: {
        email: "jane@foodbridge.com",
        phone: "+1 (555) 987-6543",
        linkedin: "https://linkedin.com/in/janesmith",
      },
      expertise: ["Software Architecture", "AI/ML", "System Scaling"]
    },
    {
      id: 3,
      name: "Manali Khedekar",
      contact: {
        email: "alex@foodbridge.com",
        phone: "+1 (555) 456-7890",
        linkedin: "https://linkedin.com/in/alexjohnson"
      },
      expertise: ["Logistics", "Supply Chain", "Partner Relations"]
    }
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">
    {/* Project Description and Logo Row */}
    <div className="flex flex-col md:flex-row items-stretch mb-16 gap-8">
      {/* Project Description */}
      <div className="md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition duration-300">
        <h1 className="text-4xl font-extrabold text-green-600 mb-6">About FoodBridge</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          FoodBridge connects surplus food from businesses to communities in need through our real-time matching platform.
          We've redirected <span className="font-bold text-green-600">10M+ meals</span> since 2020.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Our technology helps restaurants, grocers, and producers reduce waste while supporting local shelters and food banks.
        </p>
      </div>

      {/* Logo Section - Now without card background */}
      <div className="md:w-1/2 flex items-center justify-center">
        <div className="relative w-full h-full min-h-[200px] max-w-md mx-auto">
          <Image
            src="/foodbridge.png"
            alt="FoodBridge Logo"
            fill
            className="object-contain transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 80vw, 40vw"
            priority
          />
        </div>
      </div>
    </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center flex items-center justify-center">
          <FaUsers className="text-green-500 mr-3" /> Meet Our Leadership Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transform transition duration-300 hover:-translate-y-1">
              {/* Image */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-1">{member.name}</h3>

                {/* Expertise */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">EXPERTISE</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full animate-pulse hover:animate-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">CONTACT</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-3 hover:text-green-600 transition-colors">
                      <FaEnvelope />
                      <a href={`mailto:${member.contact.email}`}>{member.contact.email}</a>
                    </div>
                    <div className="flex items-center gap-3 hover:text-green-600 transition-colors">
                      <FaPhone />
                      <a href={`tel:${member.contact.phone.replace(/\D/g, '')}`}>{member.contact.phone}</a>
                    </div>
                    {member.contact.linkedin && (
                      <div className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                        <FaLinkedin />
                        <a href={member.contact.linkedin} target="_blank" rel="noopener noreferrer">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
