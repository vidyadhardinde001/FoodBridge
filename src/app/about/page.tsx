import { FaUsers, FaLinkedin, FaEnvelope, FaPhone, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      role: "Founder & CEO",
      bio: "Former restaurant owner with 15+ years in food industry. Pioneered our food redistribution model after witnessing waste firsthand.",
      image: "/team/john.jpg",
      contact: {
        email: "john@foodbridge.com",
        phone: "+1 (555) 123-4567",
        linkedin: "https://linkedin.com/in/johndoe",
        twitter: "https://twitter.com/johndoe"
      },
      expertise: ["Food Industry", "Operations", "Business Strategy"]
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Chief Technology Officer",
      bio: "Full-stack developer specializing in logistics platforms. Previously led engineering at FoodTech Inc. Passionate about tech for social good.",
      image: "/team/jane.jpg",
      contact: {
        email: "jane@foodbridge.com",
        phone: "+1 (555) 987-6543",
        linkedin: "https://linkedin.com/in/janesmith",
        twitter: "https://twitter.com/janesmith"
      },
      expertise: ["Software Architecture", "AI/ML", "System Scaling"]
    },
    {
      id: 3,
      name: "Alex Johnson",
      role: "Head of Operations",
      bio: "Supply chain expert with a decade in perishable goods logistics. Designed our award-winning distribution network.",
      image: "/team/alex.jpg",
      contact: {
        email: "alex@foodbridge.com",
        phone: "+1 (555) 456-7890",
        linkedin: "https://linkedin.com/in/alexjohnson"
      },
      expertise: ["Logistics", "Supply Chain", "Partner Relations"]
    }
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Project Description and Logo Row */}
      <div className="flex flex-col md:flex-row items-stretch mb-12 gap-8">
        {/* Project Description Card */}
        <div className="md:w-1/2 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-green-600 mb-6">About FoodBridge</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              FoodBridge connects surplus food from businesses to communities in need through 
              our real-time matching platform. We've redirected 10M+ meals since 2020.
            </p>
            <p>
              Our technology helps restaurants, grocers, and producers reduce waste while 
              supporting local shelters and food banks.
            </p>
          </div>
        </div>

        {/* Logo Card */}
        <div className="md:w-1/2 flex items-center justify-center bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Image
            src="/images/foodbridge.png"
            alt="FoodBridge Logo"
            width={400}
            height={200}
            className="object-contain w-full h-auto max-w-xs"
          />
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
          <FaUsers className="text-green-500 mr-3" /> Meet Our Leadership Team
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
              {/* Profile Image */}
              <div className="relative h-64 bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Profile Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-green-600 font-medium mb-4">{member.role}</p>
                
                {/* Bio */}
                <p className="text-gray-600 mb-4">{member.bio}</p>
                
                {/* Expertise */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">EXPERTISE</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">CONTACT</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <FaEnvelope className="text-green-500 mr-3" />
                      <a href={`mailto:${member.contact.email}`} className="hover:text-green-600">
                        {member.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaPhone className="text-green-500 mr-3" />
                      <a href={`tel:${member.contact.phone.replace(/\D/g, '')}`} className="hover:text-green-600">
                        {member.contact.phone}
                      </a>
                    </div>
                    {member.contact.linkedin && (
                      <div className="flex items-center text-gray-700">
                        <FaLinkedin className="text-green-500 mr-3" />
                        <a href={member.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {member.contact.twitter && (
                      <div className="flex items-center text-gray-700">
                        <FaTwitter className="text-green-500 mr-3" />
                        <a href={member.contact.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                          Twitter
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