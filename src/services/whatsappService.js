import API_BASE_URL from '../config/api';

/**
 * Meta WhatsApp Cloud API Service
 * Handles POST requests to our Node.js backend.
 */

/**
 * Sends a WhatsApp message using the approved template.
 * 
 * @param {Object} contact - Contact details containing at least { phone }
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>} Response status
 */
export const sendWhatsAppMessage = async (contact) => {
  console.log('✓ WhatsApp Send Started', contact);

  // Validate presence of phone number
  if (!contact?.phone || typeof contact.phone !== 'string' || contact.phone.trim().length === 0) {
    const error = 'Cannot send WhatsApp: phone number is missing.';
    console.error('✓ WhatsApp Send Failed:', error);
    return { success: false, error };
  }

  const cleanField = (val) => {
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

  try {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone: contact.phone.trim(),
        name: cleanField(contact.name),
        fullName: cleanField(contact.name),
        company: cleanField(contact.company),
        title: cleanField(contact.title ? contact.title : contact.notes),
        email: cleanField(contact.email),
        website: cleanField(contact.website),
        address: cleanField(contact.address)
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.message || `HTTP error ${response.status}`;
      console.error('✓ WhatsApp Send Failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log('✓ WhatsApp Send Success', data);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('✓ WhatsApp Send Failed:', error.message);
    return { success: false, error: error.message };
  }
};
