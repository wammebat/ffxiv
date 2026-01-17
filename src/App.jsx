import React, { useState } from 'react';
import { Menu, X, Hammer, Sprout, TrendingUp, Swords, Moon, Map } from 'lucide-react';

// Mock XIVAPI service
const searchRecipes = async (query) => {
  // Mock data - replace with actual XIVAPI calls
  return {
    Results: [
      { ID: 1, Name: 'Iron Ingot', RecipeLevelTable: { ClassJobLevel: 15 } },
      { ID: 2, Name: 'Steel Ingot', RecipeLevelTable: { ClassJobLevel: 30 } },
      { ID: 3, Name: 'Mythril Ingot', RecipeLevelTable: { ClassJobLevel: 45 } }
    ]
  };
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'crafting', icon: Hammer, label: 'Crafting Assistant' },
    { id: 'gathering', icon: Sprout, label: 'Gathering Tracker', disabled: true },
    { id: 'loot', icon: TrendingUp, label: 'Loot Farming', disabled: true },
    { id: 'raids', icon: Swords, label: 'Raid Plans', disabled: true },
    { id: 'island', icon: Moon, label: 'Island Sanctuary', disabled: true },
    { id: 'fieldops', icon: Map, label: 'Field Operations', disabled: true }
  ];

  return (
    <div className={`
      flex flex-col bg-gray-900 border-r border-gray-700
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      <div className={`flex items-center p-4 border-b border-gray-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-white">FFXIV Tools</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <nav className="p-2 space-y-1">
        {menuItems.map(({ id, icon: Icon, label, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && setActiveTab(id)}
            disabled={disabled}
            title={isCollapsed ? label : ''}
            className={`
              w-full flex items-center rounded-lg transition-colors duration-200
              ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} 
              ${activeTab === id 
                ? 'bg-blue-600 text-white' 
                : disabled
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:bg-gray-800'
              }
            `}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{label}</span>
                {disabled && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'crafting', icon: Hammer, label: 'Crafting Assistant' },
    { id: 'gathering', icon: Sprout, label: 'Gathering Tracker', disabled: true },
    { id: 'loot', icon: TrendingUp, label: 'Loot Farming', disabled: true },
    { id: 'raids', icon: Swords, label: 'Raid Plans', disabled: true },
    { id: 'island', icon: Moon, label: 'Island Sanctuary', disabled: true },
    { id: 'fieldops', icon: Map, label: 'Field Operations', disabled: true }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-gray-900 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">FFXIV Tools</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map(({ id, icon: Icon, label, disabled }) => (
            <button
              key={id}
              onClick={() => {
                if (!disabled) {
                  setActiveTab(id);
                  setIsOpen(false);
                }
              }}
              disabled={disabled}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${activeTab === id 
                  ? 'bg-blue-600 text-white' 
                  : disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
              {disabled && (
                <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// Inventory Manager Component
const InventoryManager = ({ inventory, setInventory }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  const addItem = () => {
    if (itemName && quantity) {
      setInventory([...inventory, { 
        id: Date.now(), 
        name: itemName, 
        quantity: parseInt(quantity) 
      }]);
      setItemName('');
      setQuantity('');
    }
  };

  const removeItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Your Inventory</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {inventory.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No items in inventory. Add items above.</p>
        ) : (
          inventory.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded">
              <span className="text-white">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-300">x{item.quantity}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Craftable Items List Component
const CraftableItemsList = ({ inventory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRecipesHandler = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const data = await searchRecipes(searchQuery);
      setRecipes(data.Results || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  const getCraftabilityStatus = (recipe) => {
    // Mock logic - replace with actual recipe requirement checking
    const rand = Math.random();
    if (rand > 0.7) return { status: 'craftable', percent: 100 };
    if (rand > 0.3) return { status: 'partial', percent: Math.floor(rand * 100) };
    return { status: 'missing', percent: 0 };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Recipe Search</h2>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search recipes (e.g., 'ingot', 'potion')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchRecipesHandler()}
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={searchRecipesHandler}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-600"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-2">
        {recipes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Search for recipes to see craftability</p>
        ) : (
          recipes.map(recipe => {
            const { status, percent } = getCraftabilityStatus(recipe);
            return (
              <div key={recipe.ID} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{recipe.Name}</h3>
                  <span className="text-gray-400 text-sm">Lv. {recipe.RecipeLevelTable?.ClassJobLevel}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'craftable' ? 'bg-green-500' :
                        status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    status === 'craftable' ? 'text-green-400' :
                    status === 'partial' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {status === 'craftable' ? 'Can Craft' :
                     status === 'partial' ? `${percent}% Ready` : 'Missing Materials'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Crafting Assistant Page
const CraftingAssistant = () => {
  const [inventory, setInventory] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Crafting Assistant</h1>
        <p className="text-gray-400">Manage your inventory and discover what you can craft</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <InventoryManager inventory={inventory} setInventory={setInventory} />
        <CraftableItemsList inventory={inventory} />
      </div>

      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-200 text-sm">
          <strong>Next Steps:</strong> This template uses mock data. Replace the searchRecipes function 
          with actual XIVAPI calls (https://xivapi.com/docs). Add recipe detail fetching to check 
          ingredient requirements against your inventory for accurate craftability checking.
        </p>
      </div>
    </div>
  );
};

// Placeholder Component for Future Features
const ComingSoon = ({ feature }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">{feature}</h2>
      <p className="text-gray-400">This feature is coming soon!</p>
    </div>
  </div>
);

// Main App Component
export default function FFXIVApp() {
  const [activeTab, setActiveTab] = useState('crafting');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Desktop Sidebar - Always Visible */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Mobile Sidebar - Only for responsive purposes */}
      <MobileSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">FFXIV Tools</h1>
          <div className="w-6" />
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'crafting' && <CraftingAssistant />}
          {activeTab === 'gathering' && <ComingSoon feature="Gathering Tracker" />}
          {activeTab === 'loot' && <ComingSoon feature="Loot Farming" />}
          {activeTab === 'raids' && <ComingSoon feature="Raid Plans" />}
          {activeTab === 'island' && <ComingSoon feature="Island Sanctuary" />}
          {activeTab === 'fieldops' && <ComingSoon feature="Field Operations" />}
        </main>
      </div>
    </div>
  );
}