import { Router } from 'express';
import { sendWhatsApp, testWhatsAppToken } from '../controllers/whatsapp.controller.js';

const router = Router();

/**
 * Send WhatsApp Template Message
 * POST /api/whatsapp/send
 */
router.post('/send', sendWhatsApp);

/**
 * Test WhatsApp Token
 * GET /api/whatsapp/test-token
 */
router.get('/test-token', testWhatsAppToken);

export default router;
