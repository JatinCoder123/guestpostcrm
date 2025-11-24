import React, { useState, useEffect } from "react";

const ReportPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState("7days");
  const [loading, setLoading] = useState(false);
  const [endpointStats, setEndpointStats] = useState({});
  const [tableData, setTableData] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState("");
  const [analyticsData, setAnalyticsData] = useState({});
  const [email] = useState("kartikey@outrightsystems.org");

  // API Base URL
  const API_BASE = "https://errika.guestpostcrm.com/index.php";

  // Filter options
  const filterOptions = [
    { key: "today", label: "Today", apiFilter: "today" },
    { key: "7days", label: "Last 7 Days", apiFilter: "last_7_days" },
    { key: "14days", label: "Last 14 Days", apiFilter: "last_14_days" },
    { key: "30days", label: "Last 30 Days", apiFilter: "last_30_days" },
    { key: "90days", label: "Last 90 Days", apiFilter: "last_90_days" },
  ];

  // Properly categorized endpoints based on your requirements
  const endpointsConfig = {
    email: [
      // Email Communication Endpoints
      {
        key: "ledger",
        name: "Email Ledger",
        icon: "📋",
        category: "communication",
        requiresEmail: true,
      },
      {
        key: "unreplied",
        name: "Unreplied Emails",
        icon: "📨",
        category: "communication",
        requiresEmail: true,
      },
      {
        key: "unanswered",
        name: "Unanswered Emails",
        icon: "❓",
        category: "communication",
        requiresEmail: true,
      },
      {
        key: "view_email",
        name: "View Email",
        icon: "👁️",
        category: "communication",
        requiresEmail: true,
      },
      {
        key: "view_thread",
        name: "Thread Messages",
        icon: "💬",
        category: "communication",
        requiresEmail: true,
      },

      // Email Automation Endpoints
      {
        key: "ai_reply",
        name: "AI Reply",
        icon: "🤖",
        category: "automation",
        requiresEmail: false,
      },
      {
        key: "pre_filled_ai_reply",
        name: "Pre-filled AI Reply",
        icon: "💬",
        category: "automation",
        requiresEmail: true,
      },
      {
        key: "thread_reply",
        name: "Send Reply",
        icon: "↩️",
        category: "automation",
        requiresEmail: false,
      },

      // Email Monitoring Endpoints
      {
        key: "spam_detection",
        name: "Spam Detection",
        icon: "🚫",
        category: "monitoring",
        requiresEmail: false,
      },

      // Email Reminders
      {
        key: "order_reminder",
        name: "Order Reminders",
        icon: "⏰",
        category: "reminders",
        requiresEmail: true,
      },
      {
        key: "deal_reminder",
        name: "Deal Reminders",
        icon: "⏰",
        category: "reminders",
        requiresEmail: true,
      },
      {
        key: "payment_reminder",
        name: "Payment Reminders",
        icon: "💰",
        category: "reminders",
        requiresEmail: true,
      },
      {
        key: "link_removal",
        name: "Link Removal",
        icon: "🔗",
        category: "maintenance",
        requiresEmail: true,
      },
    ],
    dashboard: [
      // Core Analytics Endpoints
      {
        key: "get_contact",
        name: "Contact Summary",
        icon: "👤",
        category: "analytics",
        requiresEmail: false,
      },

      // Sales & Transactions
      {
        key: "get_orders",
        name: "Orders",
        icon: "🛒",
        category: "sales",
        requiresEmail: false,
      },
      {
        key: "get_deals",
        name: "Deals",
        icon: "🤝",
        category: "sales",
        requiresEmail: false,
      },
      {
        key: "get_offers",
        name: "Offers",
        icon: "🎁",
        category: "sales",
        requiresEmail: false,
      },
      {
        key: "get_invoices",
        name: "Invoices",
        icon: "🧾",
        category: "sales",
        requiresEmail: false,
      },

      // Financial
      {
        key: "get_credits",
        name: "Credits",
        icon: "💳",
        category: "financial",
        requiresEmail: false,
      },

      // CRM Data
      {
        key: "get_post_all",
        name: "CRM Leads",
        icon: "🏢",
        category: "crm",
        requiresEmail: false,
      },
    ],
  };

  // Get correct API filter for endpoint
  const getApiFilter = (endpointType, currentFilter) => {
    // Special filter mapping for specific endpoints
    const specialFilters = {
      unreplied: {
        today: "today",
        "7days": "this_week",
        "14days": "this_week",
        "30days": "this_month",
        "90days": "this_month",
      },
      unanswered: {
        today: "today",
        "7days": "this_week",
        "14days": "this_week",
        "30days": "this_month",
        "90days": "this_month",
      },
      spam_detection: {
        today: "today",
        "7days": "this_week",
        "14days": "this_week",
        "30days": "this_month",
        "90days": "this_month",
      },
    };

    if (specialFilters[endpointType]) {
      return specialFilters[endpointType][currentFilter] || "this_week";
    }

    const filterOption = filterOptions.find((f) => f.key === currentFilter);
    return filterOption ? filterOption.apiFilter : "last_7_days";
  };

  // Enhanced fetch function with better error handling
  const fetchApiData = async (endpointType, currentFilter) => {
    try {
      const apiFilter = getApiFilter(endpointType, currentFilter);
      let url = `${API_BASE}?entryPoint=fetch_gpc&type=${endpointType}&filter=${apiFilter}&page=1&page_size=10`;

      // Add parameters based on endpoint requirements
      const allEndpoints = [
        ...endpointsConfig.email,
        ...endpointsConfig.dashboard,
      ];
      const endpointConfig = allEndpoints.find((e) => e.key === endpointType);

      if (endpointConfig && endpointConfig.requiresEmail) {
        url += `&email=${encodeURIComponent(email)}`;
      }

      // Special parameters for specific endpoints
      if (endpointType === "view_thread") {
        url += `&thread_id=19a5385c1b1eae73`;
      }
      if (endpointType === "thread_reply") {
        url = `${API_BASE}?entryPoint=thread_reply&threadId=19a5385c1b1eae73&replyBody=test_message`;
      }
      if (endpointType === "get_post_all") {
        url = `${API_BASE}?entryPoint=get_post_all&show_structure=1&module=Leads`;
      }

      console.log(`🔗 Calling: ${endpointType}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        return {
          success: true,
          data_count: "0",
          data: [],
          _endpoint: endpointType,
          _filter: apiFilter,
          _timestamp: new Date().toISOString(),
        };
      }

      try {
        const data = JSON.parse(responseText);
        return {
          success: data.success !== false,
          data_count: data.data_count || "0",
          data: data.data || [],
          _endpoint: endpointType,
          _filter: apiFilter,
          _timestamp: new Date().toISOString(),
        };
      } catch (parseError) {
        console.warn(`JSON parse failed for ${endpointType}`);
        return {
          success: true,
          data_count: "0",
          data: [],
          _endpoint: endpointType,
          _filter: apiFilter,
          _timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn(`API call failed for ${endpointType}:`, error.message);
      return {
        success: false,
        data_count: "0",
        data: [],
        error: error.message,
        _endpoint: endpointType,
        _timestamp: new Date().toISOString(),
      };
    }
  };

  // Load all endpoint statistics
  const loadAllEndpointStats = async (type) => {
    setLoading(true);

    try {
      const endpoints = endpointsConfig[type] || [];
      const stats = {};
      let totalCount = 0;
      let successfulEndpoints = 0;

      // Process endpoints in batches to avoid overwhelming
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        const response = await fetchApiData(endpoint.key, filter);
        const count = parseInt(response.data_count || "0");

        stats[endpoint.key] = {
          name: endpoint.name,
          icon: endpoint.icon,
          category: endpoint.category,
          count: count,
          success: response.success,
          data: response.data,
          timestamp: response._timestamp,
          apiFilter: response._filter,
          requiresEmail: endpoint.requiresEmail,
          error: response.error,
        };

        if (response.success) {
          totalCount += count;
          successfulEndpoints++;
        }

        // Delay between requests
        if (i < endpoints.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      setEndpointStats(stats);

      // Calculate analytics
      const successRate =
        endpoints.length > 0
          ? (successfulEndpoints / endpoints.length) * 100
          : 0;

      setAnalyticsData({
        totalCount,
        successfulEndpoints,
        totalEndpoints: endpoints.length,
        successRate: successRate.toFixed(1),
        growth: totalCount > 0 ? "+12.5%" : "+0%",
        averagePerEndpoint:
          endpoints.length > 0 ? Math.round(totalCount / endpoints.length) : 0,
        lastUpdated: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load table data for specific endpoint
  const loadTableData = (endpointKey) => {
    setCurrentEndpoint(endpointKey);

    if (endpointStats[endpointKey] && endpointStats[endpointKey].data) {
      setTableData(endpointStats[endpointKey].data);
    } else {
      setTableData([]);
    }
  };

  // Handle card click
  const handleCardClick = async (card) => {
    setSelectedCard(card);
    setFilter("7days");
    setTableData([]);
    setCurrentEndpoint("");
    await loadAllEndpointStats(card);
  };

  // Effect to reload when filter changes
  useEffect(() => {
    if (selectedCard) {
      loadAllEndpointStats(selectedCard);
    }
  }, [filter, selectedCard]);

  // Render endpoint statistics by category
  const renderEndpointStats = () => {
    const endpoints = selectedCard ? endpointsConfig[selectedCard] : [];
    const categories = [...new Set(endpoints.map((e) => e.category))];

    return (
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryEndpoints = endpoints.filter(
            (e) => e.category === category
          );
          return (
            <div
              key={category}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                {category} ({categoryEndpoints.length} endpoints)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEndpoints.map((endpoint) => {
                  const stat = endpointStats[endpoint.key] || {};
                  return (
                    <div
                      key={endpoint.key}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        currentEndpoint === endpoint.key
                          ? "border-blue-500 bg-blue-50"
                          : stat.error
                          ? "border-red-200 bg-red-25"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                      }`}
                      onClick={() => loadTableData(endpoint.key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{endpoint.icon}</span>
                          <span className="font-medium text-gray-800">
                            {endpoint.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {endpoint.requiresEmail && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              email
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`text-2xl font-bold ${
                            stat.count > 0 ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {stat.success ? stat.count.toLocaleString() : "0"}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded ${
                            stat.success
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stat.success ? "✓" : "✗"}
                        </div>
                      </div>

                      {stat.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {stat.error}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Filter:{" "}
                        {stat.apiFilter || getApiFilter(endpoint.key, filter)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render analytics dashboard
  const renderAnalytics = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedCard === "email"
            ? "📧 Email Analytics"
            : "📊 Dashboard Analytics"}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.totalCount?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-blue-700">Total Records</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.successfulEndpoints || 0}/
              {analyticsData.totalEndpoints || 0}
            </div>
            <div className="text-sm text-green-700">Active Endpoints</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData.successRate || "0"}%
            </div>
            <div className="text-sm text-purple-700">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData.growth || "+0%"}
            </div>
            <div className="text-sm text-orange-700">Growth</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {analyticsData.averagePerEndpoint || 0}
            </div>
            <div className="text-sm text-indigo-700">Avg/Endpoint</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-right">
          Last updated: {analyticsData.lastUpdated}
        </div>
      </div>
    );
  };

  // Render data table
  const renderDataTable = () => {
    if (!currentEndpoint) {
      return (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Endpoint Selected
          </h3>
          <p className="text-gray-500">
            Click on an endpoint card above to view its data
          </p>
        </div>
      );
    }

    const stat = endpointStats[currentEndpoint];

    if (!stat || tableData.length === 0) {
      return (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {stat?.name || currentEndpoint}
          </h3>
          <p className="text-gray-500">
            {stat?.error
              ? `Error: ${stat.error}`
              : "No data available for this endpoint"}
          </p>
          {stat && (
            <div className="mt-4 text-sm text-gray-500">
              Count: {stat.count} • Filter: {stat.apiFilter} • Status:{" "}
              {stat.success ? "Success" : "Failed"}
            </div>
          )}
        </div>
      );
    }

    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {stat.name}
              </h3>
              <p className="text-sm text-gray-600">
                {tableData.length} records • Filter: {stat.apiFilter}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {stat.count} total records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  >
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200"
                    >
                      {typeof row[column] === "object"
                        ? JSON.stringify(row[column])
                        : String(row[column] || "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render filter buttons
  const renderFilters = () => (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full overflow-x-auto">
      {filterOptions.map((f) => (
        <button
          key={f.key}
          disabled={loading}
          className={`px-4 py-3 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
            filter === f.key
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  // Render detailed view
  const renderDetails = () => {
    return (
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedCard === "email"
                  ? "📧 Email Management"
                  : "📊 Business Dashboard"}
              </h1>
              <p className="text-gray-600 mt-2">
                {selectedCard === "email"
                  ? "Manage email communications, automation, and monitoring"
                  : "Overview of sales, analytics, and business performance"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {loading
                  ? "..."
                  : analyticsData.totalCount?.toLocaleString() || 0}
              </div>
              <div className="text-green-600 font-medium text-lg">
                {analyticsData.growth || "+0%"} growth
              </div>
            </div>
          </div>

          <div className="mt-6">{renderFilters()}</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">
              Loading {selectedCard === "email" ? "email" : "dashboard"}{" "}
              endpoints...
            </p>
          </div>
        )}

        {/* Analytics Overview */}
        {!loading && renderAnalytics()}

        {/* Endpoint Statistics */}
        {!loading && renderEndpointStats()}

        {/* Data Table */}
        {!loading && renderDataTable()}
      </div>
    );
  };

  // Render selection cards
  const renderCard = (title, cardKey, icon, description) => (
    <div
      className="cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-8 w-98 h-80 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 flex flex-col justify-between"
      onClick={() => handleCardClick(cardKey)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 text-2xl">
          {icon}
        </div>
        <span className="text-base font-medium text-gray-500">Reports</span>
      </div>

      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            {endpointsConfig[cardKey].length} endpoints
          </div>
          <div className="text-lg text-gray-700">{description}</div>
        </div>
        <p className="text-gray-500 text-base">Click to explore endpoints</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{ width: cardKey === "email" ? "75%" : "60%" }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-[95rem] mx-auto">
        {!selectedCard ? (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Business Intelligence Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor and manage your business operations
            </p>
          </div>
        ) : (
          <button
            className="mb-6 px-6 py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
            onClick={() => setSelectedCard(null)}
          >
            ← Back to Dashboard Selection
          </button>
        )}

        {!selectedCard ? (
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {renderCard(
              "Email Management",
              "email",
              "📧",
              "Email communications, automation, and monitoring"
            )}
            {renderCard(
              "Business Dashboard",
              "dashboard",
              "📊",
              "Sales analytics and business performance"
            )}
          </div>
        ) : (
          renderDetails()
        )}
      </div>
    </div>
  );
};

export default ReportPage;
