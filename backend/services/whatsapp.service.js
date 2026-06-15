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
   async sendWhatsAppTemplate(phone, contactName = 'Customer', details = {}) {
    const { 
      WHATSAPP_ACCESS_TOKEN, 
      WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_GRAPH_API_VERSION,
      WHATSAPP_TEMPLATE_NAME,
      WHATSAPP_TEMPLATE_LANGUAGE_CODE,
      WHATSAPP_BUSINESS_PHONE
    } = config;

    // Validate configuration existence
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      const missing = [];
      if (!WHATSAPP_ACCESS_TOKEN) missing.push('WHATSAPP_ACCESS_TOKEN');
      if (!WHATSAPP_PHONE_NUMBER_ID) missing.push('WHATSAPP_PHONE_NUMBER_ID');

      logger.error(`Cannot send WhatsApp template. Configuration is missing in backend .env: ${missing.join(', ')}`);
      throw new Error(`WhatsApp API configuration is missing: ${missing.join(', ')}`);
    }

    const templateName = WHATSAPP_TEMPLATE_NAME || 'card_received';
    const languageCode = WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en';
    const apiVersion = WHATSAPP_GRAPH_API_VERSION || 'v25.0';
    
    const cleanPhone = phone.trim().replace(/[+\s-]/g, ''); // Extract digits only
    const cleanBusinessPhone = WHATSAPP_BUSINESS_PHONE ? WHATSAPP_BUSINESS_PHONE.trim().replace(/[+\s-]/g, '') : '';

    // Verify recipient is different from the business sender phone
    if (cleanPhone === cleanBusinessPhone) {
      const errMsg = 'Cannot send a WhatsApp template message to the business sender number.';
      logger.error(errMsg);
      throw new Error(errMsg);
    }

    const cleanParam = (val) => {
      if (!val || typeof val !== 'string') return 'Not Available';
      const trimmed = val.trim();
      const lower = trimmed.toLowerCase();
      if (
        trimmed === '' || 
        trimmed === '—' || 
        trimmed === 'N/A' || 
        lower === 'not provided' || 
        lower === 'unknown' || 
        lower === 'unknown company' || 
        lower === 'unknown name'
      ) {
        return 'Not Available';
      }
      return trimmed;
    };

    const greetingName = cleanParam(details.name || contactName);
    const email        = cleanParam(details.email);
    const company      = cleanParam(details.company);

    logger.info(`Preparing to send WhatsApp Template "${templateName}" to ${cleanPhone} with contactName "${contactName}"...`);

    const url = `https://graph.facebook.com/${apiVersion}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    // Only include components if the selected template actually requires parameters
    if (templateName === 'card_received') {
      payload.template.components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: greetingName }, // {{1}} Contact Name
            { type: 'text', text: email },        // {{2}} Contact Email
            { type: 'text', text: company }       // {{3}} Company Name
          ]
        }
      ];

      logger.info(`[Debug] WhatsApp template parameters: ${JSON.stringify(payload.template.components[0].parameters, null, 2)}`);
    } else {
      // Fallback/other template
      payload.template.components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: greetingName },
            { type: 'text', text: email },
            { type: 'text', text: company }
          ]
        }
      ];
    }

    const numParams = payload.template.components?.[0]?.parameters?.length || 0;
    const paramValues = payload.template.components?.[0]?.parameters?.map(p => p.text) || [];

    // Log before sending:
    // - Template Name
    // - Language
    // - Recipient
    // - Number of Parameters
    // - Parameter Values
    logger.info(`Sending WhatsApp Message Details:
- Template Name: ${templateName}
- Language: ${languageCode}
- Recipient: ${cleanPhone}
- Number of Parameters: ${numParams}
- Parameter Values: ${JSON.stringify(paramValues)}`);

    logger.info(`Outbound Meta API Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const httpStatus = response.status;
      const responseBody = response.data;
      const messageId = responseBody.messages?.[0]?.id || 'N/A';
      const messageStatus = responseBody.messages?.[0]?.message_status || 'accepted';

      logger.info('✓ WhatsApp template dispatch succeeded.');
      logger.info(`Telemetry - Template Name: ${templateName}`);
      logger.info(`Telemetry - Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID}`);
      logger.info(`Telemetry - Recipient: ${cleanPhone}`);
      logger.info(`Telemetry - HTTP Status: ${httpStatus}`);
      logger.info(`Telemetry - Response Body: ${JSON.stringify(responseBody)}`);
      logger.info(`Telemetry - Message ID: ${messageId}`);
      logger.info(`Telemetry - Message Status: ${messageStatus}`);

      return { payload, response: responseBody };
    } catch (error) {
      const httpStatus = error.response?.status || 'N/A';
      const responseBody = error.response?.data || {};
      const errMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      logger.error('✗ WhatsApp template dispatch failed.');
      logger.error(`Telemetry - Template Name: ${templateName}`);
      logger.error(`Telemetry - Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID}`);
      logger.error(`Telemetry - Recipient: ${cleanPhone}`);
      logger.error(`Telemetry - HTTP Status: ${httpStatus}`);
      logger.error(`Telemetry - Response Body: ${JSON.stringify(responseBody)}`);
      logger.error(`Telemetry - Error Message: ${errMsg}`);

      const customError = new Error(`Meta API error: ${errMsg}`);
      customError.payload = payload;
      customError.response = responseBody;
      throw customError;
    }
  }

  /**
   * Verifies the configured WHATSAPP_ACCESS_TOKEN.
   * 
   * @returns {Promise<Object>} Status of the token
   */
  async testToken() {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_GRAPH_API_VERSION } = config;
    if (!WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN === 'your_whatsapp_access_token_here') {
      return { valid: false, error: 'Token is unconfigured or a placeholder.' };
    }
    const apiVersion = WHATSAPP_GRAPH_API_VERSION || 'v25.0';
    try {
      const response = await axios.get(`https://graph.facebook.com/${apiVersion}/me`, {
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
