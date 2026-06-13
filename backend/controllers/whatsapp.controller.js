import { whatsappService } from '../services/whatsapp.service.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Send WhatsApp Message Controller
 * POST /api/whatsapp/send
 * Body: { phone, name }
 */
export const sendWhatsApp = async (req, res, next) => {
  try {
    logger.info('✓ WhatsApp Send Request Received');
    const { phone, name } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      throw new ApiError(400, 'Phone number is required and cannot be empty.');
    }

    const contactName = (name && typeof name === 'string' && name.trim().length > 0) ? name.trim() : 'Customer';
    const result = await whatsappService.sendWhatsAppTemplate(phone.trim(), contactName);

    res.status(200).json({
      success: true,
      message: 'WhatsApp template sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test WhatsApp Token Controller
 * GET /api/whatsapp/test-token
 */
export const testWhatsAppToken = async (req, res, next) => {
  try {
    logger.info('GET /api/whatsapp/test-token called');
    const result = await whatsappService.testToken();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
