import React from 'react';
import { FaDumbbell } from 'react-icons/fa';

const Equipment = () => {
  // Sample equipment data
  const equipment = [
    { id: 1, name: 'Treadmill', category: 'Cardio', quantity: 8, location: 'Cardio Zone' },
    { id: 2, name: 'Bench Press', category: 'Strength Training', quantity: 5, location: 'Weight Area' },
    { id: 3, name: 'Dumbbells Set', category: 'Strength Training', quantity: 10, location: 'Free Weights' },
    { id: 4, name: 'Exercise Bike', category: 'Cardio', quantity: 6, location: 'Cardio Zone' },
    { id: 5, name: 'Yoga Mats', category: 'Flexibility', quantity: 15, location: 'Studio Room' }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gym Equipment</h1>
        <p className="text-gray-600">Browse available equipment in our campus gym</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaDumbbell className="text-indigo-600 mr-2 text-xl" />
          <h2 className="text-xl font-semibold text-gray-800">Available Equipment</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-2 px-4 text-left text-gray-700">Name</th>
                <th className="py-2 px-4 text-left text-gray-700">Category</th>
                <th className="py-2 px-4 text-left text-gray-700">Quantity</th>
                <th className="py-2 px-4 text-left text-gray-700">Location</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.category}</td>
                  <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-gray-600">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Equipment; 