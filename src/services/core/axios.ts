import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Mock data for testing
const MOCK_DATA = {
  '/api/v1/opportunities': {
    data: [
      {
        id: '1',
        opportunityCode: 'OP001',
        name: 'Dự án phát triển phần mềm quản lý cho ABC Corp',
        client: {
          id: '101',
          name: 'ABC Corporation'
        },
        estimatedValue: 500000000,
        currency: 'VND',
        dealStage: 'Qualification',
        probability: 60,
        expectedCloseDate: '2025-09-15',
        description: 'Phát triển hệ thống quản lý tài nguyên doanh nghiệp cho ABC Corp',
        createdBy: {
          id: '201',
          name: 'Nguyễn Văn A'
        },
        assignedTo: [
          {
            id: '301',
            name: 'Trần Văn B',
            teamId: '401',
            teamName: 'Team Development'
          }
        ],
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-06-10T09:30:00Z',
        lastInteractionDate: '2025-06-10T09:30:00Z',
        followupStatus: 'Green',
        onsitePriority: true,
        hubspotId: 'HS123456',
        hubspotLastSynced: '2025-06-10T09:00:00Z'
      },
      {
        id: '2',
        opportunityCode: 'OP002',
        name: 'Nâng cấp hệ thống bảo mật cho XYZ',
        client: {
          id: '102',
          name: 'XYZ Company'
        },
        estimatedValue: 300000000,
        currency: 'VND',
        dealStage: 'Negotiation',
        probability: 80,
        expectedCloseDate: '2025-08-20',
        description: 'Nâng cấp giải pháp bảo mật và triển khai VPN cho toàn bộ hệ thống',
        createdBy: {
          id: '202',
          name: 'Lê Thị C'
        },
        assignedTo: [],
        createdAt: '2025-05-15T08:00:00Z',
        updatedAt: '2025-06-05T14:20:00Z',
        lastInteractionDate: '2025-05-25T10:15:00Z',
        followupStatus: 'Yellow',
        onsitePriority: false,
        hubspotId: 'HS654321',
        hubspotLastSynced: '2025-06-05T14:00:00Z'
      },
      {
        id: '3',
        opportunityCode: 'OP003',
        name: 'Tư vấn chuyển đổi số cho DEF Corp',
        client: {
          id: '103',
          name: 'DEF Corporation'
        },
        estimatedValue: 700000000,
        currency: 'VND',
        dealStage: 'Demo',
        probability: 45,
        expectedCloseDate: '2025-10-30',
        description: 'Tư vấn và triển khai chiến lược chuyển đổi số toàn diện',
        createdBy: {
          id: '203',
          name: 'Phạm Văn D'
        },
        assignedTo: [
          {
            id: '302',
            name: 'Hoàng Thị E',
            teamId: '402',
            teamName: 'Team Consulting'
          }
        ],
        createdAt: '2025-06-05T09:15:00Z',
        updatedAt: '2025-06-15T11:45:00Z',
        lastInteractionDate: '2025-06-01T16:30:00Z',
        followupStatus: 'Red',
        onsitePriority: true,
        hubspotId: 'HS789012',
        hubspotLastSynced: '2025-06-15T11:30:00Z'
      },
      {
        id: '4',
        opportunityCode: 'OP004',
        name: 'Triển khai hệ thống ERP cho GHI Ltd',
        client: {
          id: '104',
          name: 'GHI Limited'
        },
        estimatedValue: 900000000,
        currency: 'VND',
        dealStage: 'Closed',
        probability: 100,
        expectedCloseDate: '2025-07-10',
        description: 'Triển khai hệ thống ERP SAP S/4HANA cho doanh nghiệp',
        createdBy: {
          id: '204',
          name: 'Vũ Mạnh F'
        },
        assignedTo: [
          {
            id: '303',
            name: 'Ngô Thị G',
            teamId: '403',
            teamName: 'Team Implementation'
          }
        ],
        createdAt: '2025-04-20T10:30:00Z',
        updatedAt: '2025-06-08T09:15:00Z',
        lastInteractionDate: '2025-06-07T13:45:00Z',
        followupStatus: 'Green',
        onsitePriority: false,
        hubspotId: 'HS345678',
        hubspotLastSynced: '2025-06-08T09:00:00Z'
      },
      {
        id: '5',
        opportunityCode: 'OP005',
        name: 'Phát triển ứng dụng di động cho JKL',
        client: {
          id: '105',
          name: 'JKL Corporation'
        },
        estimatedValue: 400000000,
        currency: 'VND',
        dealStage: 'Qualification',
        probability: 30,
        expectedCloseDate: '2025-11-15',
        description: 'Phát triển ứng dụng di động iOS và Android cho thương mại điện tử',
        createdBy: {
          id: '205',
          name: 'Đinh Văn H'
        },
        assignedTo: [],
        createdAt: '2025-06-18T14:00:00Z',
        updatedAt: '2025-06-18T14:00:00Z',
        lastInteractionDate: null,
        followupStatus: 'Red',
        onsitePriority: true,
        hubspotId: 'HS901234',
        hubspotLastSynced: '2025-06-18T14:00:00Z'
      }
    ],
    meta: {
      total: 5,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }
};

// Create map of regex patterns to mock data for dynamic endpoints
const DYNAMIC_MOCK_ENDPOINTS = [
  {
    pattern: /\/api\/v1\/opportunities\/([^/]+)$/,
    getData: (matches: RegExpMatchArray) => {
      const opportunityId = matches[1];
      // Find the opportunity by ID in the opportunities mock data
      const opportunityData = MOCK_DATA['/api/v1/opportunities'].data.find(
        opp => opp.id === opportunityId
      );
      
      if (opportunityData) {
        return opportunityData;
      }
      
      // Return 404 if not found
      throw {
        response: {
          status: 404,
          data: { message: 'Opportunity not found' }
        }
      };
    }
  },
  {
    pattern: /\/api\/v1\/opportunities\/([^/]+)\/notes$/,
    getData: (matches: RegExpMatchArray) => {
      const opportunityId = matches[1];
      // Return mock notes for the opportunity
      return {
        data: [
          {
            id: '101',
            opportunityId,
            content: 'Đã trao đổi với khách hàng về yêu cầu kỹ thuật.',
            createdBy: {
              id: '201',
              name: 'Nguyễn Văn A'
            },
            createdAt: '2025-06-10T09:30:00Z',
            attachments: []
          },
          {
            id: '102',
            opportunityId,
            content: 'Đã gửi bản demo cho khách hàng xem xét.',
            createdBy: {
              id: '202',
              name: 'Lê Thị C'
            },
            createdAt: '2025-06-15T14:45:00Z',
            attachments: [
              {
                id: '901',
                name: 'product-demo.pdf',
                url: 'https://example.com/files/product-demo.pdf',
                size: 2048000,
                mimeType: 'application/pdf'
              }
            ]
          }
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }
  },
  {
    pattern: /\/api\/v1\/opportunities\/sync\/logs$/,
    getData: () => {
      // Return mock sync logs
      return {
        data: [
          {
            id: '501',
            status: 'success',
            startedAt: '2025-06-10T08:00:00Z',
            completedAt: '2025-06-10T08:05:23Z',
            recordsProcessed: 18,
            recordsCreated: 3,
            recordsUpdated: 12,
            recordsFailed: 0,
            message: 'Đồng bộ thành công'
          },
          {
            id: '502',
            status: 'failed',
            startedAt: '2025-06-05T15:30:00Z',
            completedAt: '2025-06-05T15:32:45Z',
            recordsProcessed: 5,
            recordsCreated: 0,
            recordsUpdated: 2,
            recordsFailed: 3,
            message: 'Lỗi kết nối đến Hubspot API'
          }
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }
  }
];

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other state management
    const token = localStorage.getItem('token');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Setup mock responses for both GET and POST requests
const setupMockResponses = () => {
  apiClient.interceptors.request.use((config) => {
    const url = config.url;
    const method = config.method?.toLowerCase();
    
    if (!url) return config;
    
    // Check if we should use static mocked data for GET requests
    if (method === 'get' && MOCK_DATA[url as keyof typeof MOCK_DATA]) {
      console.log('Using static mock data for:', url);
      
      // Create a mock promise that resolves with the mock data
      return Promise.reject({
        config,
        response: {
          status: 200,
          data: MOCK_DATA[url as keyof typeof MOCK_DATA],
          statusText: 'OK',
          headers: {},
          config
        },
        isAxiosError: true
      });
    }
    
    // Check for dynamic endpoints for GET requests
    if (method === 'get') {
      for (const endpoint of DYNAMIC_MOCK_ENDPOINTS) {
        const matches = url.match(endpoint.pattern);
        if (matches) {
          console.log('Using dynamic mock data for:', url);
          try {
            const mockData = endpoint.getData(matches);
            return Promise.reject({
              config,
              response: {
                status: 200,
                data: mockData,
                statusText: 'OK',
                headers: {},
                config
              },
              isAxiosError: true
            });
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
    }
    
    // Special case for POST to /api/v1/opportunities/sync
    if (method === 'post' && url === '/api/v1/opportunities/sync') {
      console.log('Using mock data for POST to /api/v1/opportunities/sync');
      
      return Promise.reject({
        config,
        response: {
          status: 200,
          data: {
            id: '503',
            status: 'in_progress',
            message: 'Đồng bộ dữ liệu đang được thực hiện'
          },
          statusText: 'OK',
          headers: {},
          config
        },
        isAxiosError: true
      });
    }
    
    // Special case for POST to assign leader
    if (method === 'post' && /\/api\/v1\/opportunities\/([^/]+)\/leaders/.test(url)) {
      console.log('Using mock data for POST to assign leader');
      
      const opportunityId = url.match(/\/api\/v1\/opportunities\/([^/]+)\/leaders/)?.[1];
      const opportunityData = MOCK_DATA['/api/v1/opportunities'].data.find(
        opp => opp.id === opportunityId
      );
      
      if (opportunityData) {
        // Clone the opportunity data and add the leader
        const updatedOpportunity = { ...opportunityData };
        const requestData = config.data ? JSON.parse(config.data) : {};
        
        // If assignedTo is not an array, initialize it
        if (!updatedOpportunity.assignedTo) {
          updatedOpportunity.assignedTo = [];
        }
        
        // Add the new leader if not already present
        const assignedToArray = updatedOpportunity.assignedTo as Array<{ id: string; name: string; teamId?: string; teamName?: string }>;
        if (!assignedToArray.some(leader => leader.id === requestData.leaderId)) {
          assignedToArray.push({
            id: requestData.leaderId,
            name: 'Assigned Leader ' + requestData.leaderId,
            teamId: '401',
            teamName: 'Team Sales'
          });
        }
        
        return Promise.reject({
          config,
          response: {
            status: 200,
            data: updatedOpportunity,
            statusText: 'OK',
            headers: {},
            config
          },
          isAxiosError: true
        });
      }
    }
    
    return config;
  }, undefined);
};

// Initialize mock responses
setupMockResponses();

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    // Handle mocked responses
    if (error.response?.status === 200) {
      return Promise.resolve(error.response.data);
    }
    
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with an error status
      const status = error.response.status;

      // Handle authentication errors
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login (if not already there)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Format error for consistent handling
      const apiError: ApiError = {
        status,
        message: extractErrorMessage(error.response.data) || 'An error occurred',
        errors: extractValidationErrors(error.response.data),
      };

      return Promise.reject(apiError);
    }

    if (error.request) {
      // The request was made but no response was received
      const apiError: ApiError = {
        status: 0,
        message: 'No response from server. Please check your internet connection.',
      };
      return Promise.reject(apiError);
    }

    // Something happened in setting up the request
    const apiError: ApiError = {
      status: 0,
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(apiError);
  }
);

// Utility functions for error handling
function extractErrorMessage(data: any): string {
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return 'An unknown error occurred';
}

function extractValidationErrors(data: any): Record<string, string[]> | undefined {
  if (data?.errors && typeof data.errors === 'object') {
    return data.errors;
  }
  return undefined;
}

export default apiClient; 