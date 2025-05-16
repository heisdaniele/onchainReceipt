# ReceiptChain - Blockchain Receipt Generator

ReceiptChain is a web application that allows users to generate and manage receipts for blockchain transactions on the Base network. It supports both ETH and USDC transactions.

## Features

- Generate receipts from Base network transaction hashes
- Automatic detection of ETH and USDC transfers
- PDF receipt generation
- Email notifications using EmailJS
- Responsive design for mobile and desktop
- Local storage for persistent data
- Transaction history tracking

## Prerequisites

- Node.js (recommended v14 or higher)
- A web server to host the static files
- EmailJS account for email notifications

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd receiptchain
```

2. Configure EmailJS:
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Create a new email service
   - Create an email template with the following variables:
     - `{{to_name}}`: Customer name
     - `{{email}}`: Customer email
     - `{{receipt_id}}`: Receipt ID
     - `{{amount}}`: Transaction amount
     - `{{date}}`: Transaction date
     - `{{transaction_hash}}`: Transaction hash
     - `{{purpose}}`: Transaction purpose
     - `{{generated_date}}`: Receipt generation date

3. Configure Environment:
   - Create a `.env` file in the root directory
   - Add your EmailJS configuration:
     ```
     EMAILJS_PUBLIC_KEY=your_public_key
     EMAILJS_SERVICE_ID=your_service_id
     EMAILJS_TEMPLATE_ID=your_template_id
     ```
   - For development, you can also directly edit `config.js`
   - For production, ensure environment variables are set in your hosting platform

4. Deploy:
   - Upload the following files to your web server:
     - `index.html`
     - `script.js`
     - `config.js`
     - `styles.css`
     - `.env` (ensure this is secure and not publicly accessible)
     - All required assets

## Usage

1. **Generating a Receipt**:
   - Enter a valid Base network transaction hash
   - Click "Validate" to fetch transaction details
   - Fill in customer information
   - Click "Generate Receipt" to create the receipt

2. **Managing Receipts**:
   - View all generated receipts in the "Receipts" tab
   - Download receipts as PDF
   - Preview receipts before downloading
   - Send email notifications to customers

3. **Transaction Support**:
   - ETH transfers
   - USDC transfers (Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

## Security Notes

- Never commit your `.env` file to version control
- In production, always use environment variables instead of hardcoded values
- Ensure your EmailJS keys are kept secure
- Consider implementing rate limiting for the email service

## Dependencies

- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Font Awesome](https://fontawesome.com/) - Icons
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) - PDF generation
- [ethers.js](https://docs.ethers.org/v5/) - Blockchain interaction
- [EmailJS](https://www.emailjs.com/) - Email notifications

## Local Development

1. Install a local web server:
```bash
npm install -g http-server
```

2. Run the server:
```bash
http-server
```

3. Visit `http://localhost:8080` in your browser

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details 