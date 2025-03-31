import React from 'react';
import { MdDirectionsRun } from 'react-icons/md';

const WorkoutPosts = () => {
  // Sample workout posts data
  const posts = [
    {
      id: 1,
      title: 'Morning Cardio Routine',
      content: 'Start your day with this 20-minute cardio routine to boost your energy levels.',
      exerciseType: 'cardio',
      createdAt: '2023-04-15T08:30:00Z',
      createdBy: { name: 'Gym Staff' }
    },
    {
      id: 2,
      title: 'Full Body Strength Training',
      content: 'A comprehensive strength training workout that targets all major muscle groups.',
      exerciseType: 'strength',
      createdAt: '2023-04-10T14:15:00Z',
      createdBy: { name: 'Gym Staff' }
    },
    {
      id: 3,
      title: 'Flexibility and Stretching',
      content: 'Improve your flexibility with these essential stretching exercises.',
      exerciseType: 'flexibility',
      createdAt: '2023-04-05T16:45:00Z',
      createdBy: { name: 'Gym Staff' }
    }
  ];
  
  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Workout Posts</h1>
        <p className="text-gray-600">Fitness tips and workout routines from our gym staff</p>
      </div>
      
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{post.title}</h2>
              <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                {post.exerciseType.charAt(0).toUpperCase() + post.exerciseType.slice(1)}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">{post.content}</p>
            
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-700">{post.createdBy.name}</span>
              </div>
              <div>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPosts; 