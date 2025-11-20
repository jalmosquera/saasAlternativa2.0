/**
 * WhatsApp service for sending orders
 */

/**
 * Generate order message based on language
 * - If Spanish: Only Spanish
 * - If English: Bilingual (English + Spanish) for both customer and business owner
 * @param {Object} orderData - Order information
 * @param {Array} orderData.items - Cart items
 * @param {Object} orderData.deliveryInfo - Delivery information
 * @param {Object} orderData.user - User information
 * @param {string} language - Language code ('es' or 'en')
 * @param {Function} getTranslation - Translation function for product names
 * @returns {string} Formatted WhatsApp message
 */
export const generateOrderMessage = (orderData, language, getTranslation) => {
  // If language is English, generate bilingual message
  if (language === 'en') {
    return generateBilingualMessage(orderData);
  }

  // Otherwise, generate Spanish-only message
  return generateSpanishMessage(orderData, getTranslation);
};

/**
 * Generate Spanish-only message
 */
const generateSpanishMessage = (orderData, getTranslation) => {
  const { items, deliveryInfo, user, totalPrice } = orderData;

  const t = {
    title: '🛒 *NUEVO PEDIDO*',
    customer: '👤 *Cliente:*',
    phone: '📱 *Teléfono:*',
    delivery: '📍 *Dirección de Entrega:*',
    street: 'Calle',
    houseNumber: 'Número',
    location: 'Localidad',
    ardales: 'Ardales',
    carratraca: 'Carratraca',
    notes: '📝 *Notas:*',
    order: '🍕 *Pedido:*',
    quantity: 'Cantidad',
    unitPrice: 'Precio unitario',
    subtotal: 'Subtotal',
    ingredients: 'Ingredientes',
    additionalIngredients: 'Ingredientes adicionales',
    total: '💰 *TOTAL:*',
  };

  // Build message
  let message = `${t.title}\n\n`;

  // Customer info
  message += `${t.customer} ${user.name}\n`;
  message += `${t.phone} ${deliveryInfo.phone}\n\n`;

  // Delivery address
  message += `${t.delivery}\n`;
  message += `${t.street}: ${deliveryInfo.delivery_street}\n`;
  message += `${t.houseNumber}: ${deliveryInfo.delivery_house_number}\n`;

  // Location with translation
  const locationText = deliveryInfo.delivery_location === 'ardales' ? t.ardales : t.carratraca;
  message += `${t.location}: ${locationText}\n`;

  // Notes
  if (deliveryInfo.notes) {
    message += `\n${t.notes} ${deliveryInfo.notes}\n`;
  }

  // Order items
  message += `\n${t.order}\n`;
  message += '━━━━━━━━━━━━━━━━━━━━\n';

  items.forEach((item, index) => {
    const productName = getTranslation(item.product.translations, 'name') || 'Sin nombre';

    // Calculate base price
    const basePrice = parseFloat(item.product.price) || 0;

    // Calculate extras price
    let extrasPrice = 0;
    if (item.customization?.selectedExtras) {
      extrasPrice = item.customization.selectedExtras.reduce((sum, extra) => {
        return sum + (parseFloat(extra.price) || 0);
      }, 0);
    }

    // Total price per unit (base + extras)
    const pricePerUnit = basePrice + extrasPrice;
    const itemSubtotal = pricePerUnit * item.quantity;

    message += `${index + 1}. *${productName}*\n`;
    message += `   ${t.quantity}: ${item.quantity}\n`;
    message += `   ${t.unitPrice}: €${pricePerUnit.toFixed(2)}\n`;
    if (extrasPrice > 0) {
      message += `   (Base: €${basePrice.toFixed(2)} + Extras: €${extrasPrice.toFixed(2)})\n`;
    }
    message += `   ${t.subtotal}: €${itemSubtotal.toFixed(2)}\n`;

    // Add ingredient customization if customer deselected any
    if (item.customization) {
      const {
        /* ============================================
           COMENTADO: Ingredientes deseleccionados
           ============================================ */
        // deselectedIngredients,
        selectedOptions,
        selectedExtras,
        additionalNotes
      } = item.customization;

      /* ============================================
         COMENTADO: Mostrar ingredientes deseleccionados
         ============================================
      // Show deselected ingredients (ingredients that were removed)
      if (deselectedIngredients && deselectedIngredients.length > 0) {
        message += `   ❌ Sin: ${deselectedIngredients.join(', ')}\n`;
      }
      */

      // Show selected options (Meat Type, Sauce Type, etc.)
      if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        Object.values(selectedOptions).forEach(option => {
          message += `   ✓ ${option.optionName}: ${option.icon ? option.icon + ' ' : ''}${option.choiceName}\n`;
        });
      }

      // Add extra ingredients if selected
      if (selectedExtras && selectedExtras.length > 0) {
        const extrasText = selectedExtras
          .map(extra => `${getTranslation(extra.translations, 'name')} (+€${parseFloat(extra.price).toFixed(2)})`)
          .join(', ');
        message += `   🌟 Extras: ${extrasText}\n`;
      }

      // Add additional ingredients if provided
      if (additionalNotes && additionalNotes.trim()) {
        message += `   ${t.additionalIngredients}: ${additionalNotes}\n`;
      }
    }

    message += '\n';
  });

  message += '━━━━━━━━━━━━━━━━━━━━\n';
  message += `${t.total} €${totalPrice.toFixed(2)}`;

  return message;
};

/**
 * Generate bilingual message (English + Spanish)
 * For international customers - shows order in both languages
 */
const generateBilingualMessage = (orderData) => {
  const { items, deliveryInfo, user, totalPrice } = orderData;

  let message = '';

  // ===== ENGLISH VERSION =====
  message += '🌐 *NEW ORDER / NUEVO PEDIDO*\n';
  message += '━━━━━━━━━━━━━━━━━━━━\n';
  message += '🇬🇧 *ENGLISH*\n\n';

  message += `👤 *Customer:* ${user.name}\n`;
  message += `📱 *Phone:* ${deliveryInfo.phone}\n\n`;

  message += `📍 *Delivery Address:*\n`;
  message += `Street: ${deliveryInfo.delivery_street}\n`;
  message += `Number: ${deliveryInfo.delivery_house_number}\n`;
  const locationEN = deliveryInfo.delivery_location === 'ardales' ? 'Ardales' : 'Carratraca';
  message += `Location: ${locationEN}\n`;

  if (deliveryInfo.notes) {
    message += `\n📝 *Notes:* ${deliveryInfo.notes}\n`;
  }

  message += `\n🍕 *Order:*\n`;
  items.forEach((item, index) => {
    const productNameEN = item.product.translations?.en?.name || item.product.translations?.es?.name || 'No name';
    const basePrice = parseFloat(item.product.price) || 0;
    let extrasPrice = 0;
    if (item.customization?.selectedExtras) {
      extrasPrice = item.customization.selectedExtras.reduce((sum, extra) => sum + (parseFloat(extra.price) || 0), 0);
    }
    const pricePerUnit = basePrice + extrasPrice;
    const itemSubtotal = pricePerUnit * item.quantity;

    message += `${index + 1}. *${productNameEN}*\n`;
    message += `   Quantity: ${item.quantity} | Unit: €${pricePerUnit.toFixed(2)} | Subtotal: €${itemSubtotal.toFixed(2)}\n`;

    // Show customizations
    if (item.customization) {
      /* ============================================
         COMENTADO: Ingredientes deseleccionados (EN)
         ============================================
      if (item.customization.deselectedIngredients && item.customization.deselectedIngredients.length > 0) {
        message += `   ❌ Without: ${item.customization.deselectedIngredients.join(', ')}\n`;
      }
      */
      // Show selected options (EN)
      if (item.customization.selectedOptions && Object.keys(item.customization.selectedOptions).length > 0) {
        Object.values(item.customization.selectedOptions).forEach(option => {
          message += `   ✓ ${option.optionName}: ${option.icon ? option.icon + ' ' : ''}${option.choiceName}\n`;
        });
      }
      if (item.customization.selectedExtras && item.customization.selectedExtras.length > 0) {
        const extrasText = item.customization.selectedExtras
          .map(extra => `${extra.translations?.en?.name || extra.translations?.es?.name} (+€${parseFloat(extra.price).toFixed(2)})`)
          .join(', ');
        message += `   🌟 Extras: ${extrasText}\n`;
      }
      if (item.customization.additionalNotes && item.customization.additionalNotes.trim()) {
        message += `   📝 Note: ${item.customization.additionalNotes}\n`;
      }
    }
  });

  message += `\n💰 *TOTAL:* €${totalPrice.toFixed(2)}\n`;

  // ===== SPANISH VERSION =====
  message += '\n━━━━━━━━━━━━━━━━━━━━\n';
  message += '🇪🇸 *ESPAÑOL*\n\n';

  message += `👤 *Cliente:* ${user.name}\n`;
  message += `📱 *Teléfono:* ${deliveryInfo.phone}\n\n`;

  message += `📍 *Dirección de Entrega:*\n`;
  message += `Calle: ${deliveryInfo.delivery_street}\n`;
  message += `Número: ${deliveryInfo.delivery_house_number}\n`;
  const locationES = deliveryInfo.delivery_location === 'ardales' ? 'Ardales' : 'Carratraca';
  message += `Localidad: ${locationES}\n`;

  if (deliveryInfo.notes) {
    message += `\n📝 *Notas:* ${deliveryInfo.notes}\n`;
  }

  message += `\n🍕 *Pedido:*\n`;
  items.forEach((item, index) => {
    const productNameES = item.product.translations?.es?.name || 'Sin nombre';
    const basePrice = parseFloat(item.product.price) || 0;
    let extrasPrice = 0;
    if (item.customization?.selectedExtras) {
      extrasPrice = item.customization.selectedExtras.reduce((sum, extra) => sum + (parseFloat(extra.price) || 0), 0);
    }
    const pricePerUnit = basePrice + extrasPrice;
    const itemSubtotal = pricePerUnit * item.quantity;

    message += `${index + 1}. *${productNameES}*\n`;
    message += `   Cantidad: ${item.quantity} | Unitario: €${pricePerUnit.toFixed(2)} | Subtotal: €${itemSubtotal.toFixed(2)}\n`;

    // Show customizations
    if (item.customization) {
      /* ============================================
         COMENTADO: Ingredientes deseleccionados (ES)
         ============================================
      if (item.customization.deselectedIngredients && item.customization.deselectedIngredients.length > 0) {
        message += `   ❌ Sin: ${item.customization.deselectedIngredients.join(', ')}\n`;
      }
      */
      // Show selected options (ES)
      if (item.customization.selectedOptions && Object.keys(item.customization.selectedOptions).length > 0) {
        Object.values(item.customization.selectedOptions).forEach(option => {
          message += `   ✓ ${option.optionName}: ${option.icon ? option.icon + ' ' : ''}${option.choiceName}\n`;
        });
      }
      if (item.customization.selectedExtras && item.customization.selectedExtras.length > 0) {
        const extrasText = item.customization.selectedExtras
          .map(extra => `${extra.translations?.es?.name || extra.translations?.en?.name} (+€${parseFloat(extra.price).toFixed(2)})`)
          .join(', ');
        message += `   🌟 Extras: ${extrasText}\n`;
      }
      if (item.customization.additionalNotes && item.customization.additionalNotes.trim()) {
        message += `   📝 Nota: ${item.customization.additionalNotes}\n`;
      }
    }
  });

  message += `\n💰 *TOTAL:* €${totalPrice.toFixed(2)}`;

  return message;
};

/**
 * Open WhatsApp with pre-filled message
 * @param {string} message - Message to send
 * @param {string} whatsappNumber - WhatsApp number to send to
 */
export const sendWhatsAppMessage = (message, whatsappNumber) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodedMessage}`;

  // Open WhatsApp in new window
  window.open(whatsappUrl, '_blank');
};

/**
 * Create order and send via WhatsApp
 * @param {Object} orderData - Complete order data
 * @param {string} language - Current language
 * @param {Function} getTranslation - Translation function
 * @param {string} whatsappNumber - WhatsApp number to send to
 */
export const sendOrderViaWhatsApp = (orderData, language, getTranslation, whatsappNumber) => {
  const message = generateOrderMessage(orderData, language, getTranslation);
  sendWhatsAppMessage(message, whatsappNumber);
};

export default {
  generateOrderMessage,
  sendWhatsAppMessage,
  sendOrderViaWhatsApp,
};
