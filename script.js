import config from './config.js';

// Debug logging for configuration
console.log('Config loaded:', {
  publicKey: config.emailjs.publicKey,
  serviceId: config.emailjs.serviceId,
  templateId: config.emailjs.templateId
});

// Constants
const EMAILJS_PUBLIC_KEY = config.emailjs.publicKey;
const EMAILJS_SERVICE_ID = config.emailjs.serviceId;
const EMAILJS_TEMPLATE_ID = config.emailjs.templateId;
const BASE_USDC_CONTRACT = config.baseNetwork.usdcContract;

// Storage keys
const STORAGE_KEYS = {
  RECEIPTS: 'receiptchain_receipts',
  INVOICES: 'receiptchain_invoices',
  USER: 'receiptchain_user'
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize EmailJS
  console.log('Initializing EmailJS with public key:', EMAILJS_PUBLIC_KEY);
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized');

  // Initialize user data from localStorage
  initializeUserData();
  
  // Initialize receipts and invoices from localStorage
  loadStoredData();

  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  function setActiveTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(button => {
      if (button.getAttribute('data-tab') === tabId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Update tab contents
    tabContents.forEach(content => {
      if (content.id === `${tabId}-tab`) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      setActiveTab(tabId);
    });
  });

  // Transaction form functionality
  const transactionForm = document.getElementById('transaction-form');
  const transactionIdInput = document.getElementById('transaction-id');
  const copyButton = document.getElementById('copy-button');
  const validateButton = document.getElementById('validate-button');
  const transactionFormContainer = document.getElementById('transaction-form-container');
  const receiptFormContainer = document.getElementById('receipt-form-container');
  const receiptForm = document.getElementById('receipt-form');
  const backButton = document.getElementById('back-button');
  const receiptGeneratedContainer = document.getElementById('receipt-generated-container');
  const recentActivity = document.getElementById('recent-activity');
  const invoiceTableContainer = document.getElementById('invoice-table-container');
  const invoiceTableBody = document.getElementById('invoice-table-body');
  const invoiceCardsContainer = document.getElementById('invoice-cards-container');

  // Show/hide copy button based on input
  transactionIdInput.addEventListener('input', function() {
    if (this.value.trim() !== '') {
      copyButton.classList.remove('hidden');
      validateButton.disabled = false;
    } else {
      copyButton.classList.add('hidden');
      validateButton.disabled = true;
    }
  });

  // Copy to clipboard functionality
  copyButton.addEventListener('click', function() {
    navigator.clipboard.writeText(transactionIdInput.value);
    
    // Show check icon temporarily
    const originalIcon = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fa-solid fa-check"></i><span class="sr-only">Copied</span>';
    
    setTimeout(() => {
      copyButton.innerHTML = originalIcon;
    }, 2000);
  });

  // Transaction validation
  async function validateTransaction(txHash) {
    try {
      console.log('Starting transaction validation for:', txHash);
      validateButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Validating...';
      validateButton.disabled = true;

      // Initialize ethers provider
      const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
      console.log('Provider initialized');
      
      // Get transaction receipt
      console.log('Fetching transaction receipt...');
      const receipt = await provider.getTransactionReceipt(txHash);
      console.log('Receipt received:', receipt);
      
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      // Get transaction details
      console.log('Fetching transaction details...');
      const tx = await provider.getTransaction(txHash);
      console.log('Transaction details:', tx);
      
      // USDC contract on Base
      const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const usdcTransferEvent = 'Transfer(address,address,uint256)';
      
      let amount;
      let currency;
      
      // Check if it's a USDC transfer
      if (receipt.logs.some(log => log.address.toLowerCase() === usdcAddress.toLowerCase())) {
        // Find USDC transfer log
        const transferLog = receipt.logs.find(log => 
          log.address.toLowerCase() === usdcAddress.toLowerCase() &&
          log.topics[0] === ethers.utils.id(usdcTransferEvent)
        );
        
        if (transferLog) {
          const parsedLog = ethers.utils.defaultAbiCoder.decode(
            ['uint256'],
            transferLog.data
          );
          amount = ethers.utils.formatUnits(parsedLog[0], 6); // USDC has 6 decimals
          currency = 'USDC';
        }
      } else {
        // ETH transfer
        amount = ethers.utils.formatEther(tx.value);
        currency = 'ETH';
      }

      // Show receipt form
      transactionFormContainer.classList.add('hidden');
      receiptFormContainer.classList.remove('hidden');
      
      // Populate transaction data
      document.getElementById('tx-hash').value = txHash;
      document.getElementById('etherscan-link').href = `https://basescan.org/tx/${txHash}`;
      document.getElementById('amount').value = `${amount} ${currency}`;
      document.getElementById('date').value = new Date().toLocaleDateString();
      
    } catch (error) {
      console.error('Validation error:', error);
      alert('Invalid transaction hash or network error. Please try again.');
    } finally {
      // Reset validation button
      validateButton.innerHTML = 'Validate';
      validateButton.disabled = false;
    }
  }

  // Transaction validation button click handler
  validateButton.addEventListener('click', async function() {
    const txId = transactionIdInput.value.trim();
    if (txId) {
      await validateTransaction(txId);
    }
  });

  // Back button functionality
  backButton.addEventListener('click', function() {
    receiptFormContainer.classList.add('hidden');
    transactionFormContainer.classList.remove('hidden');
  });

  // Receipt form submission
  receiptForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const receiptData = {
      txHash: document.getElementById('tx-hash').value,
      amount: document.getElementById('amount').value,
      date: document.getElementById('date').value,
      customerName: document.getElementById('customer-name').value,
      customerEmail: document.getElementById('customer-email').value,
      purpose: document.getElementById('purpose').value,
      receiptId: `RCP-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage
    const storedReceipts = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPTS)) || [];
    storedReceipts.unshift(receiptData);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(storedReceipts));
    
    // Update UI
    updateReceiptUI(receiptData);
    loadStoredData(); // Refresh stats and recent activity
  });

  function updateReceiptUI(receiptData) {
    // Show receipt generated view
    receiptFormContainer.classList.add('hidden');
    receiptGeneratedContainer.classList.remove('hidden');
    recentActivity.classList.add('hidden');
    invoiceTableContainer.classList.remove('hidden');
    
    // Populate receipt data
    document.getElementById('receipt-id').textContent = `Receipt ID: ${receiptData.receiptId}`;
    document.getElementById('receipt-customer-name').textContent = receiptData.customerName;
    document.getElementById('receipt-customer-email').textContent = receiptData.customerEmail;
    document.getElementById('receipt-amount').textContent = receiptData.amount;
    document.getElementById('receipt-date').textContent = receiptData.date;
    document.getElementById('receipt-purpose').textContent = receiptData.purpose;
    document.getElementById('receipt-hash').textContent = receiptData.txHash;
    document.getElementById('receipt-etherscan-link').href = `https://basescan.org/tx/${receiptData.txHash}`;

    // Update modal data
    document.getElementById('modal-receipt-id').textContent = receiptData.receiptId;
    document.getElementById('modal-customer-name').textContent = receiptData.customerName;
    document.getElementById('modal-customer-email').textContent = receiptData.customerEmail;
    document.getElementById('modal-amount').textContent = receiptData.amount;
    document.getElementById('modal-date').textContent = receiptData.date;
    document.getElementById('modal-purpose').textContent = receiptData.purpose;
    document.getElementById('modal-hash').textContent = receiptData.txHash;
    document.getElementById('modal-generated-date').textContent = new Date().toLocaleDateString();
    
    // Add to invoice table
    addInvoiceToTable({
      id: `INV-${Date.now().toString().slice(-6)}`,
      customer: receiptData.customerName,
      email: receiptData.customerEmail,
      hash: receiptData.txHash,
      amount: receiptData.amount,
      date: receiptData.date,
      status: 'Paid',
      purpose: receiptData.purpose,
      receiptId: receiptData.receiptId
    });
  }

  // New receipt button functionality
  document.getElementById('new-receipt-button').addEventListener('click', function() {
    // Reset forms
    transactionForm.reset();
    receiptForm.reset();
    
    // Show transaction form
    receiptGeneratedContainer.classList.add('hidden');
    transactionFormContainer.classList.remove('hidden');
    recentActivity.classList.remove('hidden');
    invoiceTableContainer.classList.add('hidden');
  });

  // Receipt preview functionality
  document.getElementById('preview-button').addEventListener('click', function() {
    const modal = document.getElementById('receipt-modal');
    
    // Populate modal with receipt data
    document.getElementById('modal-receipt-id').textContent = document.getElementById('receipt-id').textContent.replace('Receipt ID: ', '');
    document.getElementById('modal-receipt-id-2').textContent = document.getElementById('receipt-id').textContent.replace('Receipt ID: ', '');
    document.getElementById('modal-customer-name').textContent = document.getElementById('receipt-customer-name').textContent;
    document.getElementById('modal-customer-email').textContent = document.getElementById('receipt-customer-email').textContent;
    document.getElementById('modal-amount').textContent = document.getElementById('receipt-amount').textContent;
    document.getElementById('modal-total').textContent = document.getElementById('receipt-amount').textContent;
    document.getElementById('modal-date').textContent = document.getElementById('receipt-date').textContent;
    document.getElementById('modal-purpose').textContent = document.getElementById('receipt-purpose').textContent;
    document.getElementById('modal-hash').textContent = document.getElementById('receipt-hash').textContent;
    document.getElementById('modal-generated-date').textContent = new Date().toLocaleDateString();
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
  });

  // Close modal functionality
  document.getElementById('close-modal').addEventListener('click', function() {
    const modal = document.getElementById('receipt-modal');
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  });

  // Close modal when clicking outside
  document.getElementById('receipt-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
      setTimeout(() => {
        this.classList.add('hidden');
      }, 300);
    }
  });

  // Function to add invoice to table
  function addInvoiceToTable(invoice) {
    // Create table row for desktop view
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div>
          <p class="font-medium">${invoice.customer}</p>
          <p class="text-sm text-gray-500">${invoice.email}</p>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-1">
          <span class="font-mono text-xs truncate max-w-[100px]">${invoice.hash}</span>
          <a href="https://etherscan.io/tx/${invoice.hash}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-external-link text-xs"></i>
          </a>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">${invoice.amount}</td>
      <td class="px-6 py-4 whitespace-nowrap">${invoice.date}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${invoice.status}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap max-w-[150px] truncate" title="${invoice.purpose}">${invoice.purpose}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right">
        <div class="flex justify-end gap-2">
          <button class="p-1 border rounded-md">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="p-1 border rounded-md">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </td>
    `;
    
    // Add to table
    invoiceTableBody.prepend(tr);
    
    // Create card for mobile view
    const card = document.createElement('div');
    card.className = 'rounded-lg border bg-card p-4';
    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="font-medium">${invoice.customer}</h3>
          <p class="text-sm text-gray-500">${invoice.email}</p>
        </div>
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${invoice.status}</span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p class="text-gray-500">Amount</p>
          <p class="font-medium">${invoice.amount}</p>
        </div>
        <div>
          <p class="text-gray-500">Date</p>
          <p class="font-medium">${invoice.date}</p>
        </div>
      </div>

      <div class="mb-3">
        <p class="text-gray-500 text-sm">Purpose</p>
        <p class="text-sm truncate" title="${invoice.purpose}">${invoice.purpose}</p>
      </div>

      <div class="mb-3">
        <p class="text-gray-500 text-sm">Transaction Hash</p>
        <div class="flex items-center gap-1">
          <span class="font-mono text-xs truncate">${invoice.hash.substring(0, 16)}...</span>
          <a href="https://etherscan.io/tx/${invoice.hash}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-external-link text-xs"></i>
          </a>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-2 border-t pt-3">
        <button class="px-3 py-1 border rounded-md flex items-center text-sm">
          <i class="fa-solid fa-eye mr-1 text-xs"></i>
          View
        </button>
        <button class="px-3 py-1 border rounded-md flex items-center text-sm">
          <i class="fa-solid fa-download mr-1 text-xs"></i>
          Download
        </button>
      </div>
    `;
    
    // Add to cards container
    invoiceCardsContainer.prepend(card);
  }

  // Download button functionality
  document.getElementById('download-button').addEventListener('click', async function() {
    const downloadButton = this;
    const originalContent = downloadButton.innerHTML;
    downloadButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Generating PDF...';
    downloadButton.disabled = true;

    try {
      const printable = document.getElementById('printable-receipt');
      if (!printable) throw new Error("Missing printable container");

      const receiptId = document.getElementById('modal-receipt-id').textContent;
      const storedReceipts = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPTS)) || [];
      const receipt = storedReceipts.find(r => r.receiptId === receiptId);
      
      if (!receipt) throw new Error("Receipt not found");

      // Create receipt HTML
      const receiptHTML = generateReceiptHTML(receipt);
      printable.innerHTML = receiptHTML;
      printable.classList.remove('hidden');

      // Generate PDF and send email
      const pdfBlob = await html2pdf()
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `receipt-${receipt.receiptId}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .from(printable)
        .outputPdf('blob');

      try {
        // Send email notification
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            email: receipt.customerEmail,
            to_name: receipt.customerName,
            receipt_id: receipt.receiptId,
            amount: receipt.amount,
            date: receipt.date,
            transaction_hash: receipt.txHash,
            purpose: receipt.purpose,
            generated_date: new Date().toLocaleDateString()
          }
        );

        // Download PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `receipt-${receipt.receiptId}.pdf`;
        link.click();
        URL.revokeObjectURL(pdfUrl);

        alert('Receipt has been downloaded and email notification sent!');
      } catch (err) {
        console.error('Email sending failed:', err);
        alert('PDF downloaded but email sending failed. Please try again.');
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF.');
    } finally {
      printable.innerHTML = '';
      printable.classList.add('hidden');
      downloadButton.innerHTML = originalContent;
      downloadButton.disabled = false;
    }
  });

  function generateReceiptHTML(receipt) {
    return `
      <div style="font-family: sans-serif; padding: 20px; max-width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4c1d95; font-size: 24px; margin-bottom: 10px;">ReceiptChain</h1>
          <p style="color: #666; font-size: 14px;">Blockchain Receipt Solutions</p>
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4c1d95; font-size: 20px; margin-bottom: 15px;">Receipt Details</h2>
          <p><strong>Receipt ID:</strong> ${receipt.receiptId}</p>
          <p><strong>Date:</strong> ${receipt.date}</p>
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4c1d95; font-size: 20px; margin-bottom: 15px;">Customer Information</h2>
          <p><strong>Name:</strong> ${receipt.customerName}</p>
          <p><strong>Email:</strong> ${receipt.customerEmail}</p>
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4c1d95; font-size: 20px; margin-bottom: 15px;">Transaction Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; border: 1px solid #ccc;">Description</th>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ccc;">${receipt.purpose}</td>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${receipt.amount}</td>
            </tr>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #ccc;">Total</td>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: right;">${receipt.amount}</td>
            </tr>
          </table>
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4c1d95; font-size: 20px; margin-bottom: 15px;">Blockchain Info</h2>
          <p><strong>Transaction Hash:</strong></p>
          <div style="max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 4px; margin: 8px 0;">
            <p style="font-family: monospace; margin: 0;">${receipt.txHash}</p>
          </div>
          <p style="margin-top: 8px;"><a href="https://basescan.org/tx/${receipt.txHash}" style="color: #4c1d95; text-decoration: none;">View on BaseScan</a></p>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
          <p style="text-align: center;">This is an electronically generated receipt.</p>
          <p style="text-align: center;">Generated on ${receipt.date}</p>
        </div>
      </div>
    `;
  }

  // Initialize user data
  function initializeUserData() {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || {
      name: '',
      email: ''
    };
    
    // Update header user info
    const userNameElement = document.querySelector('.sm\\:flex .text-sm.font-medium');
    const userEmailElement = document.querySelector('.sm\\:flex .text-xs.text-gray-500');
    
    if (userNameElement) userNameElement.textContent = userData.name || 'Guest User';
    if (userEmailElement) userEmailElement.textContent = userData.email || 'No email set';
  }

  // Load stored receipts and invoices
  function loadStoredData() {
    // Load and display receipts
    const storedReceipts = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECEIPTS)) || [];
    const recentActivity = document.querySelector('#recent-activity .space-y-4');
    
    if (recentActivity) {
      recentActivity.innerHTML = storedReceipts.slice(0, 3).map(receipt => `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
              <i class="fa-solid fa-receipt text-purple-600"></i>
            </div>
            <div>
              <p class="text-sm font-medium">Receipt Generated</p>
              <p class="text-xs text-gray-500">For ${receipt.customerName}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm">${receipt.amount}</p>
            <p class="text-xs text-gray-500">${formatTimeAgo(receipt.timestamp)}</p>
          </div>
        </div>
      `).join('');
    }

    // Update stats
    updateStats(storedReceipts);
  }

  // Update dashboard stats
  function updateStats(receipts) {
    const stats = {
      totalReceipts: receipts.length,
      totalValue: receipts.reduce((sum, receipt) => {
        const amount = parseFloat(receipt.amount.split(' ')[0]);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0),
      monthlyChange: {
        receipts: 0,
        value: 0
      }
    };

    // Calculate monthly changes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonthReceipts = receipts.filter(r => new Date(r.timestamp) > lastMonth);
    
    stats.monthlyChange.receipts = thisMonthReceipts.length;
    stats.monthlyChange.value = thisMonthReceipts.reduce((sum, receipt) => {
      const amount = parseFloat(receipt.amount.split(' ')[0]);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Update UI
    document.querySelector('[data-stat="total-receipts"]').textContent = stats.totalReceipts;
    document.querySelector('[data-stat="total-receipts-change"]').textContent = 
      `+${stats.monthlyChange.receipts} from last month`;
    document.querySelector('[data-stat="total-value"]').textContent = 
      `${stats.totalValue.toFixed(2)} ETH`;
    document.querySelector('[data-stat="total-value-change"]').textContent = 
      `+${stats.monthlyChange.value.toFixed(2)} ETH from last month`;
  }

  // Helper function to format time ago
  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  }
});