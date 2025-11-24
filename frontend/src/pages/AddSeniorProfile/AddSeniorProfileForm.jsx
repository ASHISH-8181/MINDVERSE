import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'; // Import icons

const AddSeniorProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from auth context
  const [seniorSubjects, setSeniorSubjects] = useState([{ subject: '', marks: '' }]); // For multiple subjects and marks
  const [seniorDescription, setSeniorDescription] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [availability, setAvailability] = useState(''); // New state for availability
  const [connectionLink, setConnectionLink] = useState(''); // New state for connection link
  const [loading, setLoading] = useState(false);
  const [seniors, setSeniors] = useState([]); // State to store all seniors
  const [seniorName, setSeniorName] = useState(''); // New state for senior name

  // Load seniors from localStorage on mount
  useEffect(() => {
    const storedSeniors = localStorage.getItem('seniors');
    if (storedSeniors) {
      try {
        setSeniors(JSON.parse(storedSeniors));
      } catch (error) {
        console.error('Error loading seniors from localStorage:', error);
      }
    }
  }, []);

  const handleSubjectChange = (index, e) => {
    const newSubjects = [...seniorSubjects];
    newSubjects[index][e.target.name] = e.target.value;
    setSeniorSubjects(newSubjects);
  };

  const addSubjectField = () => {
    setSeniorSubjects([...seniorSubjects, { subject: '', marks: '' }]);
  };

  const removeSubjectField = (index) => {
    const newSubjects = [...seniorSubjects];
    newSubjects.splice(index, 1);
    setSeniorSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!seniorName.trim()) {
        toast.error('Please enter a senior name.');
        setLoading(false);
        return;
      }

      // Create new senior profile object
      const newSenior = {
        id: Date.now(), // Simple ID using timestamp
        name: seniorName,
        subjects: seniorSubjects.filter(s => s.subject.trim() !== ''), // Filter out empty subjects
        description: seniorDescription,
        profilePictureUrl,
        availability,
        connectionLink,
        userId: user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
      };

      // Add new senior to list
      const updatedSeniors = [...seniors, newSenior];
      
      // Save to localStorage
      localStorage.setItem('seniors', JSON.stringify(updatedSeniors));
      
      // Update state
      setSeniors(updatedSeniors);

      // Reset form
      setSeniorName('');
      setSeniorSubjects([{ subject: '', marks: '' }]);
      setSeniorDescription('');
      setProfilePictureUrl('');
      setAvailability('');
      setConnectionLink('');

      toast.success('Senior profile added successfully!');
      // Optionally navigate after a delay
      setTimeout(() => {
        navigate('/connect-to-seniors');
      }, 1000);
    } catch (error) {
      console.error('Error adding senior profile:', error);
      toast.error('Failed to add senior profile.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a senior
  const deleteSenior = (id) => {
    const updatedSeniors = seniors.filter(senior => senior.id !== id);
    localStorage.setItem('seniors', JSON.stringify(updatedSeniors));
    setSeniors(updatedSeniors);
    toast.success('Senior profile deleted!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Senior Profiles Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Add Your Senior Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="seniorName" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  id="seniorName"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="e.g., John Doe"
                  value={seniorName}
                  onChange={(e) => setSeniorName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="seniorSubjects" className="block text-sm font-medium text-gray-300 mb-2">Subject Specialties & Marks</label>
                {seniorSubjects.map((subjectData, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      name="subject"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                      placeholder="Subject (e.g., Mathematics)"
                      value={subjectData.subject}
                      onChange={(e) => handleSubjectChange(index, e)}
                      required
                    />
                    <input
                      type="text"
                      name="marks"
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                      placeholder="Marks (e.g., 95%)"
                      value={subjectData.marks}
                      onChange={(e) => handleSubjectChange(index, e)}
                      required
                    />
                    {seniorSubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectField(index)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubjectField}
                  className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  <FaPlus className="mr-1" /> Add Another Subject
                </button>
              </div>
              <div>
                <label htmlFor="seniorDescription" className="block text-sm font-medium text-gray-300">Description / Bio</label>
                <textarea
                  id="seniorDescription"
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="Tell us about your experience and how you can help..."
                  value={seniorDescription}
                  onChange={(e) => setSeniorDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-gray-300">Profile Picture URL</label>
                <input
                  type="text"
                  id="profilePictureUrl"
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="e.g., https://example.com/your-image.jpg"
                  value={profilePictureUrl}
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-300">Availability to Connect</label>
                <input
                  type="text"
                  id="availability"
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="e.g., Mon, Wed, Fri (3-5 PM)"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="connectionLink" className="block text-sm font-medium text-gray-300">Connection Link</label>
                <input
                  type="text"
                  id="connectionLink"
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  placeholder="e.g., https://linkedin.com/in/yourprofile"
                  value={connectionLink}
                  onChange={(e) => setConnectionLink(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Add Profile'}
              </button>
            </form>
          </div>

          {/* Seniors List Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">
              Added Seniors ({seniors.length})
            </h2>
            {seniors.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No seniors added yet. Add one using the form!</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {seniors.map((senior) => (
                  <div key={senior.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-blue-400">{senior.name}</h3>
                      <button
                        onClick={() => deleteSenior(senior.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                        title="Delete senior"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{senior.description}</p>
                    {senior.subjects.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-400">Subjects: </span>
                        <span className="text-xs text-gray-300">
                          {senior.subjects.map(s => `${s.subject} (${s.marks})`).join(', ')}
                        </span>
                      </div>
                    )}
                    {senior.availability && (
                      <p className="text-xs text-gray-400">
                        <strong>Available:</strong> {senior.availability}
                      </p>
                    )}
                    {senior.connectionLink && (
                      <p className="text-xs text-blue-300 mt-1">
                        <a href={senior.connectionLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View Profile →
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSeniorProfileForm;
