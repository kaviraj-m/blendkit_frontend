'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gymScheduleApi } from '@/services/api';
import { GymSchedule } from '@/types';
import { hasPermission } from '@/utils/rbac';
import GymNavigation from '@/components/GymNavigation';

export default function GymSchedulePage() {
  const { user, token } = useAuth();
  const [schedules, setSchedules] = useState<GymSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Partial<GymSchedule> | null>(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    openingTime: '06:00',
    closingTime: '22:00',
    isActive: true,
    specialNote: '',
  });

  const canManageSchedule = user && hasPermission(user.role, 'manage_gym_schedule');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await gymScheduleApi.getAll();
      console.log('Fetched schedules:', data);
      setSchedules(data);
    } catch (err) {
      setError('Failed to load gym schedules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!token) return;

      if (currentSchedule?.id) {
        // Update existing schedule
        await gymScheduleApi.update(currentSchedule.id, formData, token);
      } else {
        // Create new schedule
        await gymScheduleApi.create(formData, token);
      }

      // Refresh schedules list
      await fetchSchedules();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to save gym schedule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (!token) return;
      await gymScheduleApi.delete(id, token);
      await fetchSchedules();
    } catch (err) {
      setError('Failed to delete gym schedule');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (schedule: GymSchedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      day: schedule.day,
      openingTime: schedule.openingTime,
      closingTime: schedule.closingTime,
      isActive: schedule.isActive,
      specialNote: schedule.specialNote || '',
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentSchedule(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      openingTime: '06:00',
      closingTime: '22:00',
      isActive: true,
      specialNote: '',
    });
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      Monday: 'bg-blue-100 text-blue-800',
      Tuesday: 'bg-green-100 text-green-800',
      Wednesday: 'bg-yellow-100 text-yellow-800',
      Thursday: 'bg-purple-100 text-purple-800',
      Friday: 'bg-pink-100 text-pink-800',
      Saturday: 'bg-indigo-100 text-indigo-800',
      Sunday: 'bg-red-100 text-red-800',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <GymNavigation />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gym Schedule</h1>
          <p className="text-gray-600">View gym operating hours and scheduled classes</p>
        </div>
        {canManageSchedule && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Schedule
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <li key={schedule.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDayColor(schedule.day)}`}>
                        {schedule.day}
                      </span>
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-900">
                      <span className="font-medium">Hours:</span> {schedule.openingTime} - {schedule.closingTime}
                    </div>
                    {schedule.specialNote && (
                      <div className="mt-1 text-sm text-gray-600 italic">
                        Note: {schedule.specialNote}
                      </div>
                    )}
                  </div>
                  {canManageSchedule && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(schedule)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">No schedules found</li>
          )}
        </ul>
      </div>

      {/* Add/Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {currentSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                    Day of Week
                  </label>
                  <select
                    name="day"
                    id="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    name="openingTime"
                    id="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    name="closingTime"
                    id="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="specialNote" className="block text-sm font-medium text-gray-700">
                    Special Note (Optional)
                  </label>
                  <textarea
                    name="specialNote"
                    id="specialNote"
                    value={formData.specialNote}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    placeholder="Add any special notes about this schedule"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}