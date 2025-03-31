import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

const GymSchedule = () => {
  // Sample schedule data
  const schedules = [
    { id: 1, day: 'Monday', openingTime: '06:00', closingTime: '21:00' },
    { id: 2, day: 'Tuesday', openingTime: '06:00', closingTime: '21:00' },
    { id: 3, day: 'Wednesday', openingTime: '06:00', closingTime: '21:00' },
    { id: 4, day: 'Thursday', openingTime: '06:00', closingTime: '21:00' },
    { id: 5, day: 'Friday', openingTime: '06:00', closingTime: '21:00' },
    { id: 6, day: 'Saturday', openingTime: '08:00', closingTime: '18:00' },
    { id: 7, day: 'Sunday', openingTime: '08:00', closingTime: '18:00' }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gym Schedule</h1>
        <p className="text-gray-600">Weekly operating hours for the campus gym</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaCalendarCheck className="text-indigo-600 mr-2 text-xl" />
          <h2 className="text-xl font-semibold text-gray-800">Weekly Schedule</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-2 px-4 text-left text-gray-700">Day</th>
                <th className="py-2 px-4 text-left text-gray-700">Opening Time</th>
                <th className="py-2 px-4 text-left text-gray-700">Closing Time</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-medium">{schedule.day}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.openingTime} AM</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.closingTime} PM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymSchedule; 