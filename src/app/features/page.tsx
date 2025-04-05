import {
    FaExchangeAlt,
    FaChartLine,
    FaComments,
    FaCheckCircle,
    FaBell,
    FaSearch,
    FaMapMarkerAlt,
    FaUserCheck,
    FaStar,
    FaShoppingCart,
    FaShieldAlt
  } from 'react-icons/fa';
  import Image from 'next/image';
  
  const FeaturesPage = () => {
    const features = [
      {
        icon: <FaExchangeAlt className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Real-Time Matching",
        description: "Instant connection between food donors and recipients based on location and availability",
        image: "/features/matching.jpg"
      },
      {
        icon: <FaChartLine className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Provider & Charity Dashboards",
        description: "Custom dashboards for food providers and charities with analytics and management tools",
        image: "/features/dashboard.jpg"
      },
      {
        icon: <FaComments className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Integrated Messaging",
        description: "Complete chat system for direct communication between parties",
        image: "/features/chat.jpg"
      },
      {
        icon: <FaCheckCircle className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Request & Confirm System",
        description: "Streamlined process for food requests and confirmations with digital paperwork",
        image: "/features/confirm.jpg"
      },
      {
        icon: <FaBell className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Smart Food Notifications",
        description: "Instant platform alerts and email notifications for new food availability",
        image: "/features/notifications.jpg"
      },
      {
        icon: <FaSearch className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Advanced Search & Sorting",
        description: "Filter food listings by type, distance, quantity, and dietary requirements",
        image: "/features/search.jpg"
      },
      {
        icon: <FaMapMarkerAlt className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Live Map Integration",
        description: "Interactive maps showing donor locations, routes, and nearby charities",
        image: "/features/map.jpg"
      },
      {
        icon: <FaUserCheck className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Verification System",
        description: "Verified profiles for all users with background checks for charities",
        image: "/features/verification.jpg"
      },
      {
        icon: <FaStar className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Profile Ratings & Reviews",
        description: "Reputation system with ratings and feedback for all transactions",
        image: "/features/ratings.jpg"
      },
      {
        icon: <FaShoppingCart className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Cart System",
        description: "Reserve multiple food items and manage them in your cart before confirming",
        image: "/features/cart.jpg"
      },
      {
        icon: <FaShieldAlt className="text-3xl text-green-500 group-hover:animate-bounce" />,
        title: "Food Safety Compliance",
        description: "Automated temperature logs and handling guidelines for all transfers",
        image: "/features/safety.jpg"
      }
    ];
  
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-white via-green-50 to-white">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-green-600 mb-4 animate-fade-in">FoodBridge Features</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-100">
            Everything you need to efficiently connect surplus food with those who need it most
          </p>
        </div>
  
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-100 h-full flex flex-col animate-fade-in-up"
            >
              {/* Feature Image */}
              <div className="h-48 relative bg-gray-100 overflow-hidden rounded-t-xl">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  priority={index < 3}
                />
              </div>
  
              {/* Feature Content */}
              <div className="p-6 flex-grow">
                <div className="flex items-start mb-4">
                  <div className="mr-4 mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 mt-2">{feature.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default FeaturesPage;
  