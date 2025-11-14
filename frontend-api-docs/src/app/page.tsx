'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronRight, Code } from 'lucide-react';
import axios from 'axios';

interface ApiRoute {
  method: string;
  path: string;
  description: string;
  authentication: boolean;
  requestBody?: any;
  queryParams?: any;
  response?: any;
  example?: string;
  note?: string;
}

interface ApiCategory {
  category: string;
  routes: ApiRoute[];
}

export default function ApiDocsPage() {
  const [routes, setRoutes] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<ApiRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/docs/routes`);
      setRoutes(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].category);
        setSelectedRoute(response.data[0].routes[0]);
      }
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  }

  const filteredRoutes = routes.filter(category =>
    category.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.routes.some(route =>
      route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-700',
      POST: 'bg-green-100 text-green-700',
      PATCH: 'bg-yellow-100 text-yellow-700',
      DELETE: 'bg-red-100 text-red-700',
      PUT: 'bg-purple-100 text-purple-700',
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">GlamBooking API</h1>
          <p className="text-lg text-pink-100">
            Complete REST API reference for building booking management applications
          </p>
          <div className="mt-6 flex items-center gap-4">
            <code className="bg-white/10 px-4 py-2 rounded-lg">
              Base URL: {process.env.NEXT_PUBLIC_API_URL}/api
            </code>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-2">
              {filteredRoutes.map((category) => (
                <div key={category.category}>
                  <button
                    onClick={() => setSelectedCategory(category.category)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
                      selectedCategory === category.category
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.category}
                  </button>
                  {selectedCategory === category.category && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.routes.map((route, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedRoute(route)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                            selectedRoute === route
                              ? 'bg-purple-50 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${getMethodColor(route.method)}`}>
                            {route.method}
                          </span>
                          {route.path}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedRoute && (
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getMethodColor(selectedRoute.method)}`}>
                    {selectedRoute.method}
                  </span>
                  <code className="text-lg font-mono">{selectedRoute.path}</code>
                </div>

                <p className="text-gray-700 mb-6">{selectedRoute.description}</p>

                {selectedRoute.authentication && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      🔒 <strong>Authentication required:</strong> Include JWT token in Authorization header
                    </p>
                  </div>
                )}

                {selectedRoute.queryParams && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Query Parameters</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(selectedRoute.queryParams, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRoute.requestBody && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Request Body</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(selectedRoute.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRoute.response && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Response</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        {typeof selectedRoute.response === 'string'
                          ? selectedRoute.response
                          : JSON.stringify(selectedRoute.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRoute.example && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      Example
                    </h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        {selectedRoute.example}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRoute.note && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      ℹ️ <strong>Note:</strong> {selectedRoute.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
