import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaCalendarCheck, FaClipboardList, FaUserCheck } from 'react-icons/fa';
import { MdDirectionsRun } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';

const Gym = () => {
  const { user } = useAuth();
  
  // Define gym features available to users
  const gymFeatures = [
    {
      id: 1,
      title: 'Gym Schedule',
      description: 'Check the weekly operating hours for our campus gym facility',
      icon: <FaCalendarCheck className="text-white text-3xl" />,
      path: 'schedule',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Equipment',
      description: 'Browse available equipment and check their locations in the gym',
      icon: <FaClipboardList className="text-white text-3xl" />,
      path: 'equipment',
      color: 'bg-green-500',
    },
    {
      id: 3,
      title: 'Workout Posts',
      description: 'Discover fitness tips, workouts, and guidance from our gym staff',
      icon: <MdDirectionsRun className="text-white text-3xl" />,
      path: 'workout-posts',
      color: 'bg-purple-500',
    },
    {
      id: 4,
      title: 'Attendance Tracking',
      description: 'Track your gym visits and manage check-in/out records',
      icon: <FaUserCheck className="text-white text-3xl" />,
      path: 'attendance',
      color: 'bg-orange-500',
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Campus Gym</h1>
        <p className="text-gray-600">
          Welcome to our campus gym facility. Explore the available resources and information below.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {gymFeatures.map((feature) => (
          <Link
            key={feature.id}
            to={feature.path}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col"
          >
            <div className={`${feature.color} p-4 flex justify-center`}>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                {feature.icon}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Gym;