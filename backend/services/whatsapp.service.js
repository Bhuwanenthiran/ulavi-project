import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import axios from 'axios';

/**
 * WhatsApp Service
 * Handles template messaging using the Meta WhatsApp Cloud API (v25.0).
 */
class WhatsappService {
  /**
   * Sends the approved test template to the specified phone number.
   * 
   * Meta API Endpoint: POST https://graph.facebook.com/v25.0/{Phone-Number-ID}/messages
   * Headers: Authorization: Bearer {Access-Token}
   * 
   * @param {string} phone - Recipient phone number
   * @returns {Promise<Object>} Meta API response details
   */
  async sendWhatsAppTemplate(phone, contactName = 'Customer') {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = config;

    // Validate configuration existence
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      const missing = [];
      if (!WHATSAPP_ACCESS_TOKEN) missing.push('WHATSAPP_ACCESS_TOKEN');
      if (!WHATSAPP_PHONE_NUMBER_ID) missing.push('WHATSAPP_PHONE_NUMBER_ID');

      logger.error(`Cannot send WhatsApp template. Configuration is missing in backend .env: ${missing.join(', ')}`);
      throw new Error(`WhatsApp API configuration is missing: ${missing.join(', ')}`);
    }

    const cleanPhone = phone.trim().replace(/[+\s-]/g, ''); // Extract digits only or pass direct
    logger.info(`Sending WhatsApp Template "3p_direct_integration_test_template" to ${cleanPhone} with contactName "${contactName}"...`);

    const url = `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: '3p_direct_integration_test_template',
        language: {
          code: 'en_US'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: contactName
              }
            ]
          }
        ]
      }
    };

    logger.info(`Outbound Meta API Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('✓ WhatsApp template dispatch succeeded.');
      logger.info(`  Message ID: ${response.data.messages?.[0]?.id || 'N/A'}`);
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      logger.error(`Meta WhatsApp API request failed: ${errMsg}`);
      throw new Error(`Meta API error: ${errMsg}`);
    }
  }

  /**
   * Verifies the configured WHATSAPP_ACCESS_TOKEN.
   * 
   * @returns {Promise<Object>} Status of the token
   */
  async testToken() {
    const { WHATSAPP_ACCESS_TOKEN } = config;
    if (!WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN === 'your_whatsapp_access_token_here') {
      return { valid: false, error: 'Token is unconfigured or a placeholder.' };
    }
    try {
      const response = await axios.get('https://graph.facebook.com/v25.0/me', {
        headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
      });
      return { valid: true, name: response.data.name, id: response.data.id };
    } catch (error) {
      const data = error.response?.data?.error || {};
      return {
        valid: false,
        message: data.message || error.message,
        code: data.code,
        type: data.type
      };
    }
  }
}

export const whatsappService = new WhatsappService();
