import api from './api';

/**
 * Create a new order in the database
 * @param {Object} orderData - Order data
 * @param {Array} orderData.items - Cart items with product and quantity
 * @param {Object} orderData.deliveryInfo - Delivery information
 * @returns {Promise} - Created order response
 */
export const createOrder = async ({ items, deliveryInfo }) => {
  try {
    // Transform cart items to the format expected by backend
    const orderItems = items.map(item => ({
      product: item.product.id,
      quantity: item.quantity,
      customization: item.customization || null,
    }));

    // Prepare order data for backend
    const orderPayload = {
      delivery_street: deliveryInfo.delivery_street,
      delivery_house_number: deliveryInfo.delivery_house_number,
      delivery_location: deliveryInfo.delivery_location,
      phone: deliveryInfo.phone,
      notes: deliveryInfo.notes || '',
      items: orderItems,
    };

    const response = await api.post('/orders/', orderPayload);

    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders for the authenticated user
 * @returns {Promise} - List of orders
 */
export const getOrders = async () => {
  try {
    const response = await api.get('/orders/');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} - Order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Send order confirmation emails to customer and company
 * @param {Object} emailData - Email data
 * @param {string} emailData.order_id - Order ID
 * @param {string} emailData.user_name - Customer name
 * @param {string} emailData.user_email - Customer email
 * @param {string} emailData.language - Language (es/en)
 * @param {Object} emailData.delivery_info - Delivery information
 * @param {Array} emailData.items - Order items with names and customizations
 * @param {number} emailData.total_price - Total price
 * @returns {Promise} - Email send results
 */
export const sendOrderConfirmationEmails = async (emailData) => {
  try {
    const response = await api.post('/orders/send_confirmation/', emailData);
    return response.data;
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    throw error;
  }
};
