import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiMapPin, FiCheckCircle, FiSearch, FiAlertCircle, FiMail, FiTag, FiCalendar, FiSmartphone, FiStar } from 'react-icons/fi';

// AI Matching Function - Compares lost and found items
const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;
  const maxScore = 100;
  
  // Normalize text for comparison
  const normalize = (text) => text.toLowerCase().trim();
  
  // Title similarity (30 points)
  const lostTitle = normalize(lostItem.title);
  const foundTitle = normalize(foundItem.title);
  if (lostTitle.includes(foundTitle.split(' ')[0]) || foundTitle.includes(lostTitle.split(' ')[0])) {
    score += 20;
  }
  if (lostTitle === foundTitle || lostTitle.includes(foundTitle) || foundTitle.includes(lostTitle)) {
    score += 10;
  }
  
  // Description similarity (40 points)
  const lostDesc = normalize(lostItem.description + ' ' + (lostItem.color || '') + ' ' + (lostItem.brand || '') + ' ' + (lostItem.uniqueFeatures || ''));
  const foundDesc = normalize(foundItem.description + ' ' + (foundItem.color || '') + ' ' + (foundItem.brand || '') + ' ' + (foundItem.uniqueFeatures || ''));
  
  // Check for common keywords
  const lostWords = lostDesc.split(/\s+/).filter(w => w.length > 3);
  const foundWords = foundDesc.split(/\s+/).filter(w => w.length > 3);
  const commonWords = lostWords.filter(word => foundWords.includes(word));
  score += Math.min(40, (commonWords.length / Math.max(lostWords.length, foundWords.length)) * 40);
  
  // Color match (15 points)
  if (lostItem.color && foundItem.color) {
    const lostColor = normalize(lostItem.color);
    const foundColor = normalize(foundItem.color);
    if (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      score += 15;
    }
  }
  
  // Brand match (10 points)
  if (lostItem.brand && foundItem.brand) {
    const lostBrand = normalize(lostItem.brand);
    const foundBrand = normalize(foundItem.brand);
    if (lostBrand === foundBrand) {
      score += 10;
    }
  }
  
  // Location proximity (5 points) - if locations are similar
  if (lostItem.location && foundItem.location) {
    const lostLoc = normalize(lostItem.location);
    const foundLoc = normalize(foundItem.location);
    if (lostLoc.includes(foundLoc.split(' ')[0]) || foundLoc.includes(lostLoc.split(' ')[0])) {
      score += 5;
    }
  }
  
  return Math.min(maxScore, Math.round(score));
};

// Hardcoded Lost Items
const HARDCODED_LOST_ITEMS = [
  {
    _id: 'lost1',
    title: 'Lost iPhone 13 Pro',
    description: 'Lost my iPhone 13 Pro near the library yesterday. It has a black case with a sticker on the back. Please contact if found!',
    location: 'Library - Main Building',
    type: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
    color: 'Black',
    brand: 'Apple',
    size: '6.1 inch',
    uniqueFeatures: 'Black case with red sticker on back, screen protector with small crack',
    dateLost: '2024-01-20',
    contactInfo: 'alex@example.com, +91-9876543210',
    reward: '₹2000',
    postedBy: { _id: 'user1', name: 'Alex Kumar', email: 'alex@example.com' },
    createdAt: new Date('2024-01-20'),
    resolved: false,
  },
  {
    _id: 'lost2',
    title: 'Lost Wallet - Black Leather',
    description: 'Lost my black leather wallet containing ID and credit cards. Last seen in the cafeteria area.',
    location: 'Cafeteria - Block A',
    type: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eec64c24b8?w=500',
    color: 'Black',
    brand: 'Unknown',
    size: 'Standard',
    uniqueFeatures: 'Black leather, contains ID card with name "Priya Sharma", 2 credit cards',
    dateLost: '2024-01-19',
    contactInfo: 'priya@example.com, +91-9876543211',
    reward: '₹500',
    postedBy: { _id: 'user2', name: 'Priya Sharma', email: 'priya@example.com' },
    createdAt: new Date('2024-01-19'),
    resolved: false,
  },
  {
    _id: 'lost3',
    title: 'Lost AirPods Pro Case',
    description: 'Lost my AirPods Pro charging case. It\'s white with a small scratch on the front. Reward offered!',
    location: 'Gym - Sports Complex',
    type: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
    color: 'White',
    brand: 'Apple',
    size: 'Small',
    uniqueFeatures: 'White charging case, small scratch on front, AirPods Pro logo',
    dateLost: '2024-01-18',
    contactInfo: 'rahul@example.com, +91-9876543212',
    reward: '₹1000',
    postedBy: { _id: 'user3', name: 'Rahul Mehta', email: 'rahul@example.com' },
    createdAt: new Date('2024-01-18'),
    resolved: false,
  },
  {
    _id: 'lost4',
    title: 'Lost Blue Backpack',
    description: 'Lost my blue backpack with laptop and books. Has a name tag inside. Please help!',
    location: 'Lecture Hall 205 - Block C',
    type: 'lost',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eec64c24b8?w=500',
    color: 'Blue',
    brand: 'Nike',
    size: 'Medium',
    uniqueFeatures: 'Blue backpack, name tag inside says "Sneha Patel", contains MacBook and 3 notebooks',
    dateLost: '2024-01-17',
    contactInfo: 'sneha@example.com, +91-9876543213',
    reward: '₹3000',
    postedBy: { _id: 'user4', name: 'Sneha Patel', email: 'sneha@example.com' },
    createdAt: new Date('2024-01-17'),
    resolved: false,
  },
];

// Hardcoded Found Items
const HARDCODED_FOUND_ITEMS = [
  {
    _id: 'found1',
    title: 'Found Blue Backpack',
    description: 'Found a blue backpack near the parking lot. Contains books and notebooks. Please identify to claim.',
    location: 'Parking Lot - Gate 2',
    type: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eec64c24b8?w=500',
    color: 'Blue',
    brand: 'Nike',
    size: 'Medium',
    uniqueFeatures: 'Blue backpack, contains laptop and notebooks, has name tag inside',
    dateFound: '2024-01-21',
    postedBy: { _id: 'user5', name: 'Vikram Singh', email: 'vikram@example.com' },
    createdAt: new Date('2024-01-21'),
    resolved: false,
  },
  {
    _id: 'found2',
    title: 'Found Keys with Keychain',
    description: 'Found a set of keys with a red keychain near the chemistry lab. Has 4 keys attached.',
    location: 'Chemistry Lab - Block B',
    type: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
    color: 'Silver',
    brand: 'Unknown',
    size: 'Small',
    uniqueFeatures: '4 keys attached, red keychain with logo',
    dateFound: '2024-01-20',
    postedBy: { _id: 'user6', name: 'Ananya Reddy', email: 'ananya@example.com' },
    createdAt: new Date('2024-01-20'),
    resolved: false,
  },
  {
    _id: 'found3',
    title: 'Found Water Bottle',
    description: 'Found a stainless steel water bottle with stickers on it. Left in the lecture hall 301.',
    location: 'Lecture Hall 301 - Block C',
    type: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    color: 'Silver/Stainless Steel',
    brand: 'Unknown',
    size: '1 Liter',
    uniqueFeatures: 'Stainless steel, multiple stickers on it, blue cap',
    dateFound: '2024-01-19',
    postedBy: { _id: 'user7', name: 'Karan Desai', email: 'karan@example.com' },
    createdAt: new Date('2024-01-19'),
    resolved: false,
  },
  {
    _id: 'found4',
    title: 'Found Glasses Case',
    description: 'Found a black glasses case with prescription glasses inside. Found near the library entrance.',
    location: 'Library Entrance - Main Building',
    type: 'found',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
    color: 'Black',
    brand: 'Unknown',
    size: 'Standard',
    uniqueFeatures: 'Black case, contains prescription glasses, rectangular shape',
    dateFound: '2024-01-18',
    postedBy: { _id: 'user8', name: 'Meera Joshi', email: 'meera@example.com' },
    createdAt: new Date('2024-01-18'),
    resolved: false,
  },
];

export default function LostFound() {
  const { user } = useAuth();
  const [allLostItems, setAllLostItems] = useState([...HARDCODED_LOST_ITEMS]);
  const [allFoundItems, setAllFoundItems] = useState([...HARDCODED_FOUND_ITEMS]);
  const [lostItems, setLostItems] = useState([...HARDCODED_LOST_ITEMS]);
  const [foundItems, setFoundItems] = useState([...HARDCODED_FOUND_ITEMS]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lost', 'found'
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'lost',
    imageUrl: '',
    color: '',
    brand: '',
    size: '',
    uniqueFeatures: '',
    dateLost: '',
    dateFound: '',
    contactInfo: '',
    reward: '',
  });
  const [matches, setMatches] = useState({}); // Store matches for each item
  const [showMatches, setShowMatches] = useState(null); // Show matches for specific item

  useEffect(() => {
    applyFilters();
  }, [activeTab, searchTerm, allLostItems, allFoundItems]);

  useEffect(() => {
    // Calculate matches between lost and found items
    const newMatches = {};
    
    allLostItems.forEach(lostItem => {
      if (lostItem.resolved) return;
      const itemMatches = [];
      
      allFoundItems.forEach(foundItem => {
        if (foundItem.resolved) return;
        const score = calculateMatchScore(lostItem, foundItem);
        if (score >= 30) { // Only show matches with 30%+ similarity
          itemMatches.push({ foundItem, score });
        }
      });
      
      itemMatches.sort((a, b) => b.score - a.score);
      if (itemMatches.length > 0) {
        newMatches[lostItem._id] = itemMatches;
      }
    });
    
    setMatches(newMatches);
  }, [allLostItems, allFoundItems]);

  const applyFilters = () => {
    let filteredLost = [...allLostItems];
    let filteredFound = [...allFoundItems];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredLost = filteredLost.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower)
      );
      filteredFound = filteredFound.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower)
      );
    }

    setLostItems(filteredLost);
    setFoundItems(filteredFound);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      _id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
      color: formData.color || '',
      brand: formData.brand || '',
      size: formData.size || '',
      uniqueFeatures: formData.uniqueFeatures || '',
      dateLost: formData.type === 'lost' ? formData.dateLost : '',
      dateFound: formData.type === 'found' ? formData.dateFound : '',
      contactInfo: formData.contactInfo || '',
      reward: formData.type === 'lost' ? formData.reward : '',
      postedBy: {
        _id: user?._id || user?.id || 'current_user',
        name: user?.name || 'Current User',
        email: user?.email || 'user@example.com',
      },
      createdAt: new Date(),
      resolved: false,
    };

    if (formData.type === 'lost') {
      const updatedItems = [newItem, ...allLostItems];
      setAllLostItems(updatedItems);
      toast.success('Lost item posted successfully');
    } else {
      const updatedItems = [newItem, ...allFoundItems];
      setAllFoundItems(updatedItems);
      toast.success('Found item posted successfully');
    }

    setShowModal(false);
    setFormData({ 
      title: '', 
      description: '', 
      location: '', 
      type: 'lost', 
      imageUrl: '',
      color: '',
      brand: '',
      size: '',
      uniqueFeatures: '',
      dateLost: '',
      dateFound: '',
      contactInfo: '',
      reward: '',
    });
  };

  const handleClaim = (postId) => {
    toast.success('Claim request sent! Contact the finder via email.');
  };

  const handleResolve = (postId) => {
    const updatedLost = allLostItems.map(item => 
      item._id === postId ? { ...item, resolved: true } : item
    );
    const updatedFound = allFoundItems.map(item => 
      item._id === postId ? { ...item, resolved: true } : item
    );
    setAllLostItems(updatedLost);
    setAllFoundItems(updatedFound);
    toast.success('Post marked as resolved');
  };

  const handleDelete = (postId, type) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    if (type === 'lost') {
      const updatedItems = allLostItems.filter(item => item._id !== postId);
      setAllLostItems(updatedItems);
    } else {
      const updatedItems = allFoundItems.filter(item => item._id !== postId);
      setAllFoundItems(updatedItems);
    }
    
    toast.success('Post deleted successfully');
  };

  const getDisplayItems = () => {
    if (activeTab === 'lost') return lostItems;
    if (activeTab === 'found') return foundItems;
    return [...lostItems, ...foundItems];
  };

  const isOwner = (item) => {
    return item.postedBy._id === (user?._id || user?.id);
  };

  if (loading) return <Loading />;

  const displayItems = getDisplayItems();

  return (
    <div className="min-h-screen w-full bg-dashboard-bg dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-yellow-500 to-pink-600 dark:from-orange-400 dark:via-yellow-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                Lost & Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Report lost items or claim found items
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({ 
                  title: '', 
                  description: '', 
                  location: '', 
                  type: 'lost', 
                  imageUrl: '',
                  color: '',
                  brand: '',
                  size: '',
                  uniqueFeatures: '',
                  dateLost: '',
                  dateFound: '',
                  contactInfo: '',
                  reward: '',
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <FiPlus className="text-lg" /> New Post
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'all'
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
          >
            <FiAlertCircle /> Lost
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'found'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            <FiCheckCircle /> Found
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 sm:mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search items by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or create a new post!</p>
              <button
                onClick={() => {
                  setFormData({ 
                    title: '', 
                    description: '', 
                    location: '', 
                    type: 'lost', 
                    imageUrl: '',
                    color: '',
                    brand: '',
                    size: '',
                    uniqueFeatures: '',
                    dateLost: '',
                    dateFound: '',
                    contactInfo: '',
                    reward: '',
                  });
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all shadow-lg"
              >
                <FiPlus /> Create Your First Post
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayItems.map((post) => (
                <div
                  key={post._id}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border ${
                    post.resolved 
                      ? 'border-gray-300 dark:border-gray-600 opacity-60' 
                      : post.type === 'lost'
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-green-200 dark:border-green-800'
                  }`}
                >
                {/* Image Section */}
                <div className="relative overflow-hidden">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <FiAlertCircle className="text-4xl text-gray-400 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-md ${
                        post.type === 'lost'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-green-500/90 text-white'
                      }`}
                    >
                      {post.type.toUpperCase()}
                    </span>
                  </div>
                  {post.resolved && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1">
                        <FiCheckCircle /> Resolved
                      </span>
                    </div>
                  )}
                  {/* AI Match Indicator for Lost Items */}
                  {post.type === 'lost' && matches[post._id] && matches[post._id].length > 0 && !post.resolved && (
                    <div className="absolute bottom-3 left-3">
                      <button
                        onClick={() => setShowMatches(showMatches === post._id ? null : post._id)}
                        className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1 hover:from-yellow-600 hover:to-orange-600 transition-all"
                      >
                        <FiStar /> {matches[post._id].length} Potential Match{matches[post._id].length > 1 ? 'es' : ''}
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {post.description}
                  </p>
                  
                  {/* Highlighted Important Information */}
                  <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Important Details</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {post.color && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">Color:</span>
                          <span className="text-gray-700 dark:text-gray-300">{post.color}</span>
                        </div>
                      )}
                      {post.brand && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">Brand:</span>
                          <span className="text-gray-700 dark:text-gray-300">{post.brand}</span>
                        </div>
                      )}
                      {post.size && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">Size:</span>
                          <span className="text-gray-700 dark:text-gray-300">{post.size}</span>
                        </div>
                      )}
                      {post.type === 'lost' && post.dateLost && (
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-orange-600 dark:text-orange-400 text-xs" />
                          <span className="text-gray-700 dark:text-gray-300">{new Date(post.dateLost).toLocaleDateString()}</span>
                        </div>
                      )}
                      {post.type === 'found' && post.dateFound && (
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-orange-600 dark:text-orange-400 text-xs" />
                          <span className="text-gray-700 dark:text-gray-300">{new Date(post.dateFound).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {post.uniqueFeatures && (
                      <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Unique Features:</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{post.uniqueFeatures}</p>
                      </div>
                    )}
                    {post.reward && post.type === 'lost' && (
                      <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400">Reward: {post.reward}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <FiMapPin className="text-orange-600 dark:text-orange-400" />
                    <span>{post.location}</span>
                  </div>
                  
                  {/* Contact Info - Only shown to owner or when claiming */}
                  {isOwner(post) && post.contactInfo && (
                    <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Your Contact Info:</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{post.contactInfo}</p>
                    </div>
                  )}

                  {/* Posted By */}
                  {post.postedBy && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700/50 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                        {post.type === 'lost' ? 'Posted By' : 'Found By'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                          {post.postedBy.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{post.postedBy.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <FiMail className="text-orange-600 dark:text-orange-400" />
                        <span className="truncate">{post.postedBy.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!post.resolved && post.type === 'found' && !isOwner(post) && (
                      <button
                        onClick={() => handleClaim(post._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        <FiCheckCircle /> Claim Item
                      </button>
                    )}
                    {isOwner(post) && !post.resolved && (
                      <button
                        onClick={() => handleResolve(post._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        <FiCheckCircle /> Mark Resolved
                      </button>
                    )}
                    {isOwner(post) && (
                      <button
                        onClick={() => handleDelete(post._id, post.type)}
                        className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 text-white rounded-xl hover:from-red-600 hover:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
            
            {/* AI Matches Section - Displayed below the grid */}
            {showMatches && matches[showMatches] && matches[showMatches].length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiStar className="text-yellow-600 dark:text-yellow-400 text-xl" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">AI Matched Found Items</h4>
                  </div>
                  <button
                    onClick={() => setShowMatches(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Found {matches[showMatches].length} potential match{matches[showMatches].length > 1 ? 'es' : ''} for your lost item
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches[showMatches].map((match, idx) => (
                    <div
                      key={match.foundItem._id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-green-300 dark:border-green-700 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            match.score >= 70 ? 'bg-green-500' : match.score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}></div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {match.score}% Match
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                          FOUND
                        </span>
                      </div>
                      <h5 className="font-bold text-gray-900 dark:text-white mb-2">{match.foundItem.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{match.foundItem.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <FiMapPin className="text-green-600 dark:text-green-400" />
                        <span>{match.foundItem.location}</span>
                      </div>
                      <div className="flex gap-2 text-xs mb-3 flex-wrap">
                        {match.foundItem.color && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            Color: {match.foundItem.color}
                          </span>
                        )}
                        {match.foundItem.brand && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            Brand: {match.foundItem.brand}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`Contact ${match.foundItem.postedBy?.name || 'Finder'} at ${match.foundItem.postedBy?.email || 'N/A'}`);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 transition-all font-semibold text-sm"
                      >
                        Contact Finder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Post Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                      New {formData.type === 'lost' ? 'Lost' : 'Found'} Post
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formData.type === 'lost' ? 'Report a lost item' : 'Report a found item'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ 
                        title: '', 
                        description: '', 
                        location: '', 
                        type: 'lost', 
                        imageUrl: '',
                        color: '',
                        brand: '',
                        size: '',
                        uniqueFeatures: '',
                        dateLost: '',
                        dateFound: '',
                        contactInfo: '',
                        reward: '',
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      placeholder={`Enter ${formData.type === 'lost' ? 'lost' : 'found'} item title...`}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe the item in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Where was it lost/found?"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                
                {/* Important Details Section */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <FiTag className="text-orange-600 dark:text-orange-400" />
                    Important Details (for better matching)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Color</label>
                      <input
                        type="text"
                        placeholder="e.g., Black, Blue, Red"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Brand</label>
                      <input
                        type="text"
                        placeholder="e.g., Apple, Nike, Samsung"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Size</label>
                      <input
                        type="text"
                        placeholder="e.g., Small, Medium, Large"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {formData.type === 'lost' ? 'Date Lost' : 'Date Found'}
                      </label>
                      <input
                        type="date"
                        value={formData.type === 'lost' ? formData.dateLost : formData.dateFound}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [formData.type === 'lost' ? 'dateLost' : 'dateFound']: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unique Features</label>
                    <textarea
                      placeholder="Describe unique identifying features (scratches, stickers, engravings, etc.)"
                      value={formData.uniqueFeatures}
                      onChange={(e) => setFormData({ ...formData, uniqueFeatures: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>
                  
                  {formData.type === 'lost' && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contact Info</label>
                        <input
                          type="text"
                          placeholder="Email, Phone (private)"
                          value={formData.contactInfo}
                          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only visible to you</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reward (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., ₹500"
                          value={formData.reward}
                          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <FiPlus className="text-2xl text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload image or drag and drop
                      </span>
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
                  >
                    Create Post
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ 
                        title: '', 
                        description: '', 
                        location: '', 
                        type: 'lost', 
                        imageUrl: '',
                        color: '',
                        brand: '',
                        size: '',
                        uniqueFeatures: '',
                        dateLost: '',
                        dateFound: '',
                        contactInfo: '',
                        reward: '',
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}