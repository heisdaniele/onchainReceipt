// EmailJS Configuration
const config = {
  emailjs: {
    publicKey: typeof window !== 'undefined' 
      ? (window.ENV_EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'aXX5DD5himEFlgADr')
      : 'aXX5DD5himEFlgADr',
    serviceId: typeof window !== 'undefined'
      ? (window.ENV_EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_1xpxki8')
      : 'service_1xpxki8',
    templateId: typeof window !== 'undefined'
      ? (window.ENV_EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_i9mvzoi')
      : 'template_i9mvzoi'
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