// EmailJS Configuration
const config = {
  emailjs: {
    publicKey: process.env.EMAILJS_PUBLIC_KEY || 'aXX5DD5himEFlgADr',
    serviceId: process.env.EMAILJS_SERVICE_ID || 'service_1xpxki8',
    templateId: process.env.EMAILJS_TEMPLATE_ID || 'template_i9mvzoi'
  },
  baseNetwork: {
    rpcUrl: 'https://mainnet.base.org',
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }
};

// In production, these would be loaded from environment variables
// config.emailjs.publicKey = process.env.EMAILJS_PUBLIC_KEY;
// config.emailjs.serviceId = process.env.EMAILJS_SERVICE_ID;
// config.emailjs.templateId = process.env.EMAILJS_TEMPLATE_ID;

export default config; 