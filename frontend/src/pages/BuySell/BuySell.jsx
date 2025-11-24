import { useState, useEffect } from 'react';
import { CATEGORIES, ITEM_CONDITIONS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading/Loading';
import { FiPlus, FiEdit, FiTrash2, FiShoppingCart, FiUser, FiMail, FiFilter, FiTag, FiDollarSign, FiGrid } from 'react-icons/fi';

// Hardcoded sample items
const HARDCODED_ITEMS = [
  {
    _id: '1',
    title: 'MacBook Pro 13" 2020',
    description: 'Excellent condition MacBook Pro, 8GB RAM, 256GB SSD. Perfect for students. Comes with charger and original box.',
    price: 45000,
    category: 'Electronics',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
    seller: { _id: 'seller1', name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date('2024-01-15'),
  },
  {
    _id: '2',
    title: 'Calculus Textbook - Stewart',
    description: 'Calculus Early Transcendentals 8th Edition by James Stewart. Used but in good condition, no highlighting.',
    price: 1200,
    category: 'Books',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'],
    seller: { _id: 'seller2', name: 'Sarah Smith', email: 'sarah@example.com' },
    createdAt: new Date('2024-01-14'),
  },
  {
    _id: '3',
    title: 'Nike Running Shoes',
    description: 'Nike Air Max running shoes, size 9. Worn only a few times, like new condition. Perfect for gym or running.',
    price: 3500,
    category: 'Sports',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    seller: { _id: 'seller3', name: 'Mike Johnson', email: 'mike@example.com' },
    createdAt: new Date('2024-01-13'),
  },
  {
    _id: '4',
    title: 'Study Desk with Chair',
    description: 'Wooden study desk with matching chair. Compact size perfect for dorm rooms. Some minor scratches but fully functional.',
    price: 2500,
    category: 'Furniture',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
    seller: { _id: 'seller4', name: 'Emily Chen', email: 'emily@example.com' },
    createdAt: new Date('2024-01-12'),
  },
  {
    _id: '5',
    title: 'Winter Jacket - North Face',
    description: 'North Face winter jacket, size M. Excellent condition, warm and waterproof. Perfect for winter semester.',
    price: 4500,
    category: 'Clothing',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
    seller: { _id: 'seller5', name: 'David Lee', email: 'david@example.com' },
    createdAt: new Date('2024-01-11'),
  },
  {
    _id: '6',
    title: 'Physics Lab Kit',
    description: 'Complete physics lab kit with all necessary equipment. Used for one semester only, all items included.',
    price: 1800,
    category: 'Other',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500'],
    seller: { _id: 'seller6', name: 'Lisa Wang', email: 'lisa@example.com' },
    createdAt: new Date('2024-01-10'),
  },
  {
    _id: '7',
    title: 'iPad Air 4th Gen',
    description: 'iPad Air 64GB, WiFi only. Excellent condition with screen protector. Comes with Apple Pencil (1st gen).',
    price: 32000,
    category: 'Electronics',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'],
    seller: { _id: 'seller7', name: 'Alex Brown', email: 'alex@example.com' },
    createdAt: new Date('2024-01-09'),
  },
  {
    _id: '8',
    title: 'Organic Chemistry Textbook',
    description: 'Organic Chemistry by Paula Yurkanis Bruice, 7th Edition. Good condition, some notes in margins.',
    price: 1500,
    category: 'Books',
    condition: 'Fair',
    images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'],
    seller: { _id: 'seller8', name: 'Maria Garcia', email: 'maria@example.com' },
    createdAt: new Date('2024-01-08'),
  },
];

export default function BuySell() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState([...HARDCODED_ITEMS]);
  const [items, setItems] = useState([...HARDCODED_ITEMS]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({ category: '', priceRange: '', sort: 'recent' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    images: [],
  });

  useEffect(() => {
    applyFilters();
  }, [filters, allItems]);

  const applyFilters = () => {
    let filteredItems = [...allItems];

    // Filter by category
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
      if (filters.priceRange.includes('+')) {
        filteredItems = filteredItems.filter(item => item.price >= parseInt(min));
      } else {
        filteredItems = filteredItems.filter(item => item.price >= parseInt(min) && item.price <= parseInt(max));
      }
    }

    // Sort items
    if (filters.sort === 'price-low') {
      filteredItems.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      filteredItems.sort((a, b) => b.price - a.price);
    } else {
      filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setItems(filteredItems);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...imageUrls] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      _id: editingItem ? editingItem._id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500'],
      seller: {
        _id: user?._id || user?.id || 'current_user',
        name: user?.name || 'Current User',
        email: user?.email || 'user@example.com',
      },
      createdAt: editingItem ? editingItem.createdAt : new Date(),
    };

    if (editingItem) {
      // Update existing item
      const updatedAllItems = allItems.map(item => 
        item._id === editingItem._id ? newItem : item
      );
      setAllItems(updatedAllItems);
      toast.success('Item updated successfully');
    } else {
      // Add new item
      const updatedAllItems = [newItem, ...allItems];
      setAllItems(updatedAllItems);
      toast.success('Item listed successfully');
    }

    setShowModal(false);
    setEditingItem(null);
    setFormData({ title: '', description: '', price: '', category: '', condition: '', images: [] });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    const updatedAllItems = allItems.filter(item => item._id !== id);
    setAllItems(updatedAllItems);
    
    toast.success('Item deleted successfully');
  };

  const handleBuy = (item) => {
    // Notify buyer (simple client-side toast). In a real app this would trigger a purchase flow.
    toast.success(`Purchase initiated for ${item.title}! Contact seller: ${item.seller?.email || 'N/A'}`);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      condition: item.condition,
      images: item.images || [],
    });
    setShowModal(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen w-full bg-dashboard-bg dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-yellow-500 to-pink-600 dark:from-orange-400 dark:via-yellow-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                Buy & Sell Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Discover great deals or list your items for sale
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({ title: '', description: '', price: '', category: '', condition: '', images: [] });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <FiPlus className="text-lg" /> List New Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-orange-600 dark:text-orange-400 text-xl" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiTag className="text-orange-600 dark:text-orange-400" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiDollarSign className="text-green-600 dark:text-green-400" />
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="">All Prices</option>
                <option value="0-500">₹0 - ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-5000">₹1000 - ₹5000</option>
                <option value="5000+">₹5000+</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiGrid className="text-pink-600 dark:text-pink-400" />
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or list a new item!</p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: '', description: '', price: '', category: '', condition: '', images: [] });
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all shadow-lg"
              >
                <FiPlus /> List Your First Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((item) => (
            <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
              {/* Image Section */}
              <div className="relative overflow-hidden">
                {item.images?.[0] ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <FiTag className="text-4xl text-gray-400 dark:text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900 dark:text-white shadow-md">
                    {item.category}
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                  {item.description}
                </p>
                
                {/* Price and Condition */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full text-xs font-semibold text-orange-700 dark:text-orange-300">
                    {item.condition}
                  </span>
                </div>
                
                {/* Seller Information */}
                {item.seller && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700/50 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Seller</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        {item.seller.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.seller.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <FiMail className="text-orange-600 dark:text-orange-400" />
                      <span className="truncate">{item.seller.email}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {item.seller._id !== (user?._id || user?.id) && (
                    <button
                      onClick={() => handleBuy(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold transform hover:scale-105"
                    >
                      <FiShoppingCart className="text-lg" /> Buy Now
                    </button>
                  )}
                  {item.seller._id === (user?._id || user?.id) && (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
                      >
                        <FiEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 text-white rounded-xl hover:from-red-600 hover:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                      {editingItem ? 'Edit Item' : 'List New Item'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {editingItem ? 'Update your item details' : 'Fill in the details to list your item'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Item Title</label>
                  <input
                    type="text"
                    placeholder="Enter item title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your item in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="">Select Condition</option>
                    {ITEM_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Images</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
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
                        Click to upload images or drag and drop
                      </span>
                    </label>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 dark:hover:from-orange-700 dark:hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
                  >
                    {editingItem ? 'Update Item' : 'List Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
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