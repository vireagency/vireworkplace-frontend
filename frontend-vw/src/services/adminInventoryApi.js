import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vireworkplace-backend-hpca.onrender.com/api/v1';

class AdminInventoryApi {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard/admin/inventory`;
  }

  // Create a new inventory item
  async createInventoryItem(accessToken, itemData) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          itemName: itemData.itemName,
          itemSKU: itemData.itemSKU,
          itemQuantity: itemData.itemQuantity,
          itemPrice: itemData.itemPrice,
          itemCategory: itemData.itemCategory,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating inventory item:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to create inventory item',
          status: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Fetch all inventory items with pagination and filters
  async getInventoryItems(accessToken, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = queryParams.toString() 
        ? `${this.baseURL}?${queryParams.toString()}`
        : this.baseURL;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to fetch inventory items',
          status: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Fetch a single inventory item by ID
  async getInventoryItem(accessToken, itemId) {
    try {
      const response = await axios.get(`${this.baseURL}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to fetch inventory item',
          status: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Update an inventory item
  async updateInventoryItem(accessToken, itemId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/${itemId}`,
        {
          itemName: updateData.itemName,
          itemQuantity: updateData.itemQuantity,
          itemPrice: updateData.itemPrice,
          itemStatus: updateData.itemStatus,
          itemCategory: updateData.itemCategory,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to update inventory item',
          status: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Delete an inventory item
  async deleteInventoryItem(accessToken, itemId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data.message || 'Failed to delete inventory item',
          status: error.response.status,
        };
      }
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }
}

// Create and export a singleton instance
const adminInventoryApi = new AdminInventoryApi();
export default adminInventoryApi;
