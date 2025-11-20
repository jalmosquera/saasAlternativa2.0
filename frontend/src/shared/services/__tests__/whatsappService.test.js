import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateOrderMessage, sendWhatsAppMessage } from '../whatsappService';

describe('WhatsApp Service', () => {
  const mockGetTranslation = (translations, field) => {
    const translation = translations.find(t => t.language === 'es');
    return translation ? translation[field] : 'Unknown';
  };

  const mockUser = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
  };

  const mockDeliveryInfo = {
    delivery_street: 'Calle Principal',
    delivery_house_number: '123',
    delivery_location: 'ardales',
    phone: '+34623736566',
    notes: 'Ring the doorbell twice',
  };

  const mockProduct = {
    id: 1,
    price: '12.50',
    translations: [
      { language: 'es', name: 'Pizza Margherita' },
      { language: 'en', name: 'Margherita Pizza' }
    ],
    ingredients: [
      {
        id: 1,
        translations: [{ language: 'es', name: 'Tomate' }]
      },
      {
        id: 2,
        translations: [{ language: 'es', name: 'Queso' }]
      },
      {
        id: 3,
        translations: [{ language: 'es', name: 'Albahaca' }]
      }
    ]
  };

  describe('generateOrderMessage', () => {
    it('should generate message in Spanish', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: mockProduct,
            quantity: 2,
            customization: null
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 25.00
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      expect(message).toContain('🛒 *NUEVO PEDIDO*');
      expect(message).toContain('Juan Pérez');
      expect(message).toContain('+34623736566');
      expect(message).toContain('Calle Principal');
      expect(message).toContain('123');
      expect(message).toContain('Ardales');
      expect(message).toContain('Pizza Margherita');
      expect(message).toContain('Cantidad: 2');
      expect(message).toContain('€25.00');
      expect(message).toContain('Ring the doorbell twice');
    });

    it('should generate message in English', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: {
              ...mockProduct,
              translations: {
                en: { name: 'Margherita Pizza' },
                es: { name: 'Pizza Margherita' }
              }
            },
            quantity: 1,
            customization: null
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 12.50
      };

      const mockGetTranslationEn = (translations, field) => {
        const translation = translations.find(t => t.language === 'en');
        return translation ? translation[field] : 'Unknown';
      };

      const message = generateOrderMessage(orderData, 'en', mockGetTranslationEn);

      // English generates bilingual message
      expect(message).toContain('🌐 *NEW ORDER / NUEVO PEDIDO*');
      expect(message).toContain('🇬🇧 *ENGLISH*');
      expect(message).toContain('🇪🇸 *ESPAÑOL*');
      expect(message).toContain('Juan Pérez');
      expect(message).toContain('Margherita Pizza');
      expect(message).toContain('Quantity: 1');
      expect(message).toContain('€12.50');
    });

    it('should include customized ingredients when customer deselected some', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: mockProduct,
            quantity: 1,
            customization: {
              deselectedIngredients: ['Albahaca'], // Customer removed Albahaca
              selectedExtras: [],
              additionalNotes: ''
            }
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 12.50
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      expect(message).toContain('❌ Sin: Albahaca');
    });

    it('should NOT include ingredients when none are deselected', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: mockProduct,
            quantity: 1,
            customization: {
              deselectedIngredients: [], // No ingredients removed
              selectedExtras: [],
              additionalNotes: ''
            }
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 12.50
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      // Should not show "Sin:" when no ingredients are deselected
      expect(message).not.toContain('❌ Sin:');
    });

    it('should include additional ingredients notes', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: mockProduct,
            quantity: 1,
            customization: {
              deselectedIngredients: [],
              selectedExtras: [],
              additionalNotes: 'Extra cheese, no onions'
            }
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 12.50
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      expect(message).toContain('Ingredientes adicionales: Extra cheese, no onions');
    });

    it('should handle multiple items with different customizations', () => {
      const orderData = {
        items: [
          {
            id: 1,
            product: mockProduct,
            quantity: 1,
            customization: {
              deselectedIngredients: ['Albahaca'],
              selectedExtras: [],
              additionalNotes: 'Extra cheese'
            }
          },
          {
            id: 2,
            product: mockProduct,
            quantity: 2,
            customization: null
          }
        ],
        deliveryInfo: mockDeliveryInfo,
        user: mockUser,
        totalPrice: 37.50
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      expect(message).toContain('1. *Pizza Margherita*');
      expect(message).toContain('2. *Pizza Margherita*');
      expect(message).toContain('❌ Sin: Albahaca');
      expect(message).toContain('Extra cheese');
      expect(message).toContain('€37.50');
    });

    it('should translate location correctly', () => {
      const orderDataArdales = {
        items: [{ id: 1, product: mockProduct, quantity: 1, customization: null }],
        deliveryInfo: { ...mockDeliveryInfo, delivery_location: 'ardales' },
        user: mockUser,
        totalPrice: 12.50
      };

      const orderDataCarratraca = {
        items: [{ id: 1, product: mockProduct, quantity: 1, customization: null }],
        deliveryInfo: { ...mockDeliveryInfo, delivery_location: 'carratraca' },
        user: mockUser,
        totalPrice: 12.50
      };

      const messageArdales = generateOrderMessage(orderDataArdales, 'es', mockGetTranslation);
      const messageCarratraca = generateOrderMessage(orderDataCarratraca, 'es', mockGetTranslation);

      expect(messageArdales).toContain('Localidad: Ardales');
      expect(messageCarratraca).toContain('Localidad: Carratraca');
    });

    it('should not include notes if empty', () => {
      const orderData = {
        items: [{ id: 1, product: mockProduct, quantity: 1, customization: null }],
        deliveryInfo: { ...mockDeliveryInfo, notes: '' },
        user: mockUser,
        totalPrice: 12.50
      };

      const message = generateOrderMessage(orderData, 'es', mockGetTranslation);

      expect(message).not.toContain('📝 *Notas:*');
    });
  });

  describe('sendWhatsAppMessage', () => {
    beforeEach(() => {
      // Mock window.open
      window.open = vi.fn();
    });

    it('should open WhatsApp URL with encoded message', () => {
      const message = 'Test message with special chars: ñ, á, é';
      const whatsappNumber = '+34623736566';

      sendWhatsAppMessage(message, whatsappNumber);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/34623736566?text='),
        '_blank'
      );
    });

    it('should encode message properly', () => {
      const message = 'Hello World!';
      const whatsappNumber = '+34623736566';

      sendWhatsAppMessage(message, whatsappNumber);

      const callArg = window.open.mock.calls[0][0];
      expect(callArg).toContain(encodeURIComponent(message));
    });
  });
});
