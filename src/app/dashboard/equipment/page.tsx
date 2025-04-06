'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { equipmentApi } from '@/services/api';
import { Equipment } from '@/types';
import { hasPermission } from '@/utils/rbac';
import { FaDumbbell, FaMapMarkerAlt, FaTags } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import GymNavigation from '@/components/GymNavigation';

export default function EquipmentPage() {
  // CSS styles to ensure select and options have correct colors
  const selectStyles = `
    select, option {
      color: #000 !important;
      background-color: #fff !important;
    }
    select option:checked {
      color: #000 !important;
      background-color: #f0f9ff !important;
    }
    select.filter-select {
      appearance: auto;
      -webkit-appearance: menulist;
      -moz-appearance: menulist;
    }
  `;

  const { user, token } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 1,
    category: '',
    trainingType: '',
    isAvailable: true,
    location: 'Gym Area',
  });
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [trainingTypeFilter, setTrainingTypeFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);

  // Get unique categories and training types for filters
  const categories = [...new Set(equipment.map(item => item.category).filter(Boolean))];
  const trainingTypes = [...new Set(equipment.map(item => item.trainingType).filter(Boolean))];

  const canManageEquipment = user && hasPermission(user.role, 'manage_equipment');

  useEffect(() => {
    fetchEquipment();
  }, [token]);

  const fetchEquipment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token) {
        console.error('No authentication token available');
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching equipment from API...');
      
      // Use the correct API URL
      const url = 'http://localhost:3001/api/gym/equipment';
      console.log(`Making API call to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Parsed equipment data:', data);
      
      if (!Array.isArray(data)) {
        console.warn('API response is not an array, setting to empty array');
        setEquipment([]);
      } else {
        setEquipment(data);
      }
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to load equipment data. Please try again.');
      setEquipment([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to equipment data
  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = !categoryFilter ||
      (categoryFilter === '' && !item.category) ||
      item.category === categoryFilter;
    const matchesTrainingType = !trainingTypeFilter ||
      (trainingTypeFilter === '' && !item.trainingType) ||
      item.trainingType === trainingTypeFilter;
    const matchesAvailability = availabilityFilter === null || item.isAvailable === availabilityFilter;
    return matchesCategory && matchesTrainingType && matchesAvailability;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : 
              name === 'isAvailable' ? value === 'true' :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('Form submission started with data:', formData);

    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare data for API request
      const equipmentData = {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        location: formData.location,
        isAvailable: formData.isAvailable,
        category: formData.category, 
        trainingType: formData.trainingType
      };

      console.log('Submitting equipment data (stringified):', JSON.stringify(equipmentData));
      
      const url = currentEquipment?.id 
        ? `http://localhost:3001/api/gym/equipment/${currentEquipment.id}`
        : 'http://localhost:3001/api/gym/equipment';
      
      console.log(`Making ${currentEquipment?.id ? 'PATCH' : 'POST'} request to: ${url}`);
      
      const method = currentEquipment?.id ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(equipmentData)
      });
      
      console.log(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API returned status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response data:', result);

      if (currentEquipment?.id) {
        toast.success('Equipment updated successfully');
      } else {
        toast.success('Equipment added successfully');
      }

      // Refresh equipment list
      await fetchEquipment();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving equipment:', err);
      setError(`Failed to save equipment: ${err.message}`);
      toast.error(`Failed to save equipment: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (!token) return;
      await equipmentApi.delete(id, token);
      toast.success('Equipment deleted successfully');
      await fetchEquipment();
    } catch (err) {
      setError('Failed to delete equipment');
      toast.error('Failed to delete equipment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (equipment: Equipment) => {
    setCurrentEquipment(equipment);
    setFormData({
      name: equipment.name,
      description: equipment.description,
      quantity: equipment.quantity,
      category: equipment.category || '',
      trainingType: equipment.trainingType || '',
      isAvailable: equipment.isAvailable,
      location: equipment.location,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentEquipment(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: 1,
      category: '',
      trainingType: '',
      isAvailable: true,
      location: 'Gym Area',
    });
  };

  if (isLoading && equipment.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-100 rounded mb-2"></div>
          <div className="h-3 w-16 bg-blue-50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <style jsx>{selectStyles}</style>
      
      <GymNavigation />
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gym Equipment</h1>
          <p className="text-gray-600">View and manage the gym equipment available for workouts</p>
        </div>
        {canManageEquipment && (
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="mr-2">+</span> Add New Equipment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border border-red-200 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-3 md:mb-0">
            <p className="font-medium mb-1">Error</p>
            <p>{error}</p>
          </div>
          <button 
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded transition-colors" 
            onClick={() => {
              setError(null);
              if (isModalOpen) {
                handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              } else {
                fetchEquipment();
              }
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-md shadow">
        <h2 className="font-semibold text-lg mb-3">Filter Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select block w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="" className="text-gray-900 bg-white">All Categories</option>
              <option value="Cardio" className="text-gray-900 bg-white">Cardio</option>
              <option value="Strength" className="text-gray-900 bg-white">Strength</option>
              <option value="Free Weights" className="text-gray-900 bg-white">Free Weights</option>
              <option value="Machine" className="text-gray-900 bg-white">Machine</option>
              <option value="Accessories" className="text-gray-900 bg-white">Accessories</option>
              <option value="Bodyweight" className="text-gray-900 bg-white">Bodyweight</option>
            </select>
          </div>
          
          {/* Training Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
            <select
              value={trainingTypeFilter}
              onChange={(e) => setTrainingTypeFilter(e.target.value)}
              className="filter-select block w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="" className="text-gray-900 bg-white">All Training Types</option>
              <option value="Aerobic" className="text-gray-900 bg-white">Aerobic</option>
              <option value="Anaerobic" className="text-gray-900 bg-white">Anaerobic</option>
              <option value="Strength" className="text-gray-900 bg-white">Strength</option>
              <option value="Flexibility" className="text-gray-900 bg-white">Flexibility</option>
              <option value="Balance" className="text-gray-900 bg-white">Balance</option>
            </select>
          </div>
          
          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              value={availabilityFilter === null ? '' : availabilityFilter.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setAvailabilityFilter(val === '' ? null : val === 'true');
              }}
              className="filter-select block w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <option value="" className="text-gray-900 bg-white">All Availability</option>
              <option value="true" className="text-gray-900 bg-white">Available</option>
              <option value="false" className="text-gray-900 bg-white">Not Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className={`p-1 text-center text-xs text-white font-medium ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                {item.isAvailable ? 'Available' : 'Not Available'}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{item.quantity} units</span>
                </div>
                
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">{item.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaTags className="mr-2 text-blue-500" />
                    <span className="font-medium mr-1">Category:</span> 
                    {item.category || 'Not Specified'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDumbbell className="mr-2 text-blue-500" />
                    <span className="font-medium mr-1">Training:</span> 
                    {item.trainingType || 'Not Specified'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    <span className="font-medium mr-1">Location:</span> {item.location}
                  </div>
                </div>
                
                {canManageEquipment && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <FaDumbbell className="text-4xl mb-4 text-gray-300" />
            <p>No equipment found matching your filters.</p>
            {(categoryFilter || trainingTypeFilter || availabilityFilter !== null) && (
              <button 
                onClick={() => {
                  setCategoryFilter('');
                  setTrainingTypeFilter('');
                  setAvailabilityFilter(null);
                }}
                className="mt-2 text-blue-500 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="filter-select w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                      >
                        <option value="" className="text-gray-900 bg-white">Not Specified</option>
                        <option value="Cardio" className="text-gray-900 bg-white">Cardio</option>
                        <option value="Strength" className="text-gray-900 bg-white">Strength</option>
                        <option value="Free Weights" className="text-gray-900 bg-white">Free Weights</option>
                        <option value="Machine" className="text-gray-900 bg-white">Machine</option>
                        <option value="Accessories" className="text-gray-900 bg-white">Accessories</option>
                        <option value="Bodyweight" className="text-gray-900 bg-white">Bodyweight</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                      <select
                        name="trainingType"
                        value={formData.trainingType}
                        onChange={handleInputChange}
                        className="filter-select w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                      >
                        <option value="" className="text-gray-900 bg-white">Not Specified</option>
                        <option value="Aerobic" className="text-gray-900 bg-white">Aerobic</option>
                        <option value="Anaerobic" className="text-gray-900 bg-white">Anaerobic</option>
                        <option value="Strength" className="text-gray-900 bg-white">Strength</option>
                        <option value="Flexibility" className="text-gray-900 bg-white">Flexibility</option>
                        <option value="Balance" className="text-gray-900 bg-white">Balance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min={1}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <select
                        name="isAvailable"
                        value={formData.isAvailable.toString()}
                        onChange={handleInputChange}
                        className="filter-select w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                      >
                        <option value="true" className="text-gray-900 bg-white">Available</option>
                        <option value="false" className="text-gray-900 bg-white">Not Available</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="filter-select w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      style={{ color: '#000000', backgroundColor: '#ffffff' }}
                    >
                      <option value="Gym Area" className="text-gray-900 bg-white">Gym Area</option>
                      <option value="Cardio Zone" className="text-gray-900 bg-white">Cardio Zone</option>
                      <option value="Weights Section" className="text-gray-900 bg-white">Weights Section</option>
                      <option value="Fitness Studio" className="text-gray-900 bg-white">Fitness Studio</option>
                      <option value="Training Room" className="text-gray-900 bg-white">Training Room</option>
                      <option value="Storage" className="text-gray-900 bg-white">Storage</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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