import React, { useState, useEffect } from "react";

const ReportPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState("today");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  // Filter options
  const filterOptions = [
    { key: "today", label: "Today" },
    { key: "7days", label: "Last 7 Days" },
    { key: "14days", label: "Last 14 Days" },
    { key: "21days", label: "Last 21 Days" },
    { key: "30days", label: "Last 30 Days" },
    { key: "90days", label: "Last 90 Days" }
  ];

  // API endpoints configuration
  const endpoints = {
    ledger: {
      name: "Ledger",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=ledger",
      icon: "📊"
    },
    unreplied: {
      name: "Unreplied Emails",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=unreplied",
      icon: "📧"
    },
    unanswered: {
      name: "Unanswered",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=unanswered",
      icon: "❓"
    },
    orders: {
      name: "Orders",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_orders",
      icon: "🛒"
    },
    deals: {
      name: "Deals",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_deals",
      icon: "🤝"
    },
    offers: {
      name: "Offers",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_offers",
      icon: "🎁"
    },
    invoices: {
      name: "Invoices",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_invoices",
      icon: "🧾"
    },
    spam: {
      name: "Spam Detection",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=spam_detection",
      icon: "🚫"
    },
    credits: {
      name: "Credits",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_credits",
      icon: "💰"
    },
    orderReminders: {
      name: "Order Reminders",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=order_reminder",
      icon: "⏰"
    },
    dealReminders: {
      name: "Deal Reminders",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=deal_reminder",
      icon: "🔔"
    },
    paymentReminders: {
      name: "Payment Reminders",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=payment_reminder",
      icon: "💳"
    },
    linkRemoval: {
      name: "Link Removal",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=link_removal",
      icon: "🔗"
    },
    unreadEmails: {
      name: "Unread Emails",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=view_email",
      icon: "📨"
    },
    mailerSummary: {
      name: "Mailer Summary",
      url: "https://errika.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_contact",
      icon: "👥"
    }
  };

  // Filter to API parameter mapping
  const filterToApiParam = {
    today: "today",
    "7days": "last_7_days",
    "14days": "last_14_days", 
    "21days": "last_21_days",
    "30days": "last_30_days",
    "90days": "last_90_days"
  };

  // Mock data generator (replace with actual API calls)
  const generateMockData = (endpointKey, timeFilter) => {
    const baseCounts = {
      ledger: { count: 1245, growth: "+12%" },
      unreplied: { count: 23, growth: "-5%" },
      unanswered: { count: 15, growth: "+8%" },
      orders: { count: 45, growth: "+25%" },
      deals: { count: 32, growth: "+18%" },
      offers: { count: 28, growth: "+15%" },
      invoices: { count: 38, growth: "+22%" },
      spam: { count: 12, growth: "-3%" },
      credits: { count: 1500, growth: "+5%" },
      orderReminders: { count: 8, growth: "+10%" },
      dealReminders: { count: 6, growth: "+15%" },
      paymentReminders: { count: 4, growth: "+20%" },
      linkRemoval: { count: 3, growth: "+5%" },
      unreadEmails: { count: 67, growth: "+30%" },
      mailerSummary: { count: 2450, growth: "+8%" }
    };

    const timeMultipliers = {
      today: 1,
      "7days": 3,
      "14days": 6,
      "21days": 9,
      "30days": 12,
      "90days": 25
    };

    const base = baseCounts[endpointKey] || { count: 100, growth: "+10%" };
    const multiplier = timeMultipliers[timeFilter] || 1;
    
    return {
      count: base.count * multiplier,
      growth: base.growth,
      data: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 500,
        date: new Date(Date.now() - i * 86400000).toLocaleDateString()
      }))
    };
  };

  // Fetch data from API
  const fetchData = async (endpointKey, timeFilter) => {
    setLoading(true);
    try {
      const endpoint = endpoints[endpointKey];
      const apiFilter = filterToApiParam[timeFilter];
      const email = "kartikey@outrightsystems.org";
      
      let url = `${endpoint.url}&filter=${apiFilter}&page=1&page_size=50`;
      
      // Add email parameter if required for the endpoint
      if (endpointKey !== 'orders' && endpointKey !== 'deals' && endpointKey !== 'offers' && 
          endpointKey !== 'invoices' && endpointKey !== 'spam' && endpointKey !== 'credits') {
        url += `&email=${email}`;
      }

      // In a real implementation, you would make the actual API call:
      // const response = await fetch(url);
      // const result = await response.json();
      
      // For now, using mock data
      const mockData = generateMockData(endpointKey, timeFilter);
      
      setData(prev => ({
        ...prev,
        [endpointKey]: mockData
      }));
      
    } catch (error) {
      console.error(`Error fetching ${endpointKey}:`, error);
      // Fallback to mock data
      const mockData = generateMockData(endpointKey, timeFilter);
      setData(prev => ({
        ...prev,
        [endpointKey]: mockData
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCard) {
      fetchData(selectedCard, filter);
    }
  }, [selectedCard, filter]);

  const handleCardClick = (cardKey) => {
    setSelectedCard(cardKey);
    setFilter("today");
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Object.entries(endpoints).map(([key, endpoint]) => {
        const mockData = generateMockData(key, "today");
        return (
          <div
            key={key}
            className="cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            onClick={() => handleCardClick(key)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 text-xl">
                {endpoint.icon}
              </div>
              <span className="text-sm font-medium text-gray-500">Reports</span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3">{endpoint.name}</h2>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">
                {mockData.count.toLocaleString()}
              </span>
              <span className={`text-sm font-medium ${
                mockData.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {mockData.growth}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Click to view details</p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((mockData.count / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFilters = () => (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full overflow-x-auto">
      {filterOptions.map((f) => (
        <button
          key={f.key}
          className={`px-4 py-3 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
            filter === f.key 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const renderDetails = () => {
    if (!selectedCard) return null;
    
    const endpoint = endpoints[selectedCard];
    const currentData = data[selectedCard] || generateMockData(selectedCard, filter);

    return (
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {endpoint.icon} {endpoint.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {filterOptions.find(f => f.key === filter)?.label} overview
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {loading ? "..." : currentData.count.toLocaleString()}
              </div>
              <div className={`font-medium text-lg ${
                currentData.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentData.growth} from previous period
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            {renderFilters()}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                Period: {filterOptions.find(f => f.key === filter)?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90">Total Count</div>
            <div className="text-3xl font-bold mt-2">{currentData.count.toLocaleString()}</div>
            <div className="text-blue-100 text-sm mt-1">{currentData.growth} this period</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90">Success Rate</div>
            <div className="text-3xl font-bold mt-2">
              {Math.min(Math.floor((currentData.count / 2000) * 100), 100)}%
            </div>
            <div className="text-green-100 text-sm mt-1">+8.1% this period</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90">Avg. Per Day</div>
            <div className="text-3xl font-bold mt-2">
              {Math.floor(currentData.count / (filter === 'today' ? 1 : parseInt(filter.replace('days', '')) || 1))}
            </div>
            <div className="text-purple-100 text-sm mt-1">Consistent performance</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="text-sm opacity-90">Completion</div>
            <div className="text-3xl font-bold mt-2">
              {Math.min(Math.floor((currentData.count / 1500) * 100), 100)}%
            </div>
            <div className="text-orange-100 text-sm mt-1">On track</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentData.data?.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.value}</td>
                    <td className="py-3 px-4">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Refresh
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-[95rem] mx-auto">
        {!selectedCard ? (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">GPC Analytics Dashboard</h1>
            <p className="text-gray-600 text-lg">Comprehensive overview of all GPC endpoints and metrics</p>
          </div>
        ) : (
          <button
            className="mb-6 px-6 py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
            onClick={() => setSelectedCard(null)}
          >
            ← Back to Overview
          </button>
        )}

        {loading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50"></div>
        )}

        {!selectedCard ? renderOverviewCards() : renderDetails()}
      </div>
    </div>
  );
};

export default ReportPage;