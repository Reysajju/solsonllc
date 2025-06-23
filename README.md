# Royal CRM & Invoice Portal - Solson LLC

A comprehensive invoice management system with integrated payment processing, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Professional Invoice Generation**: Create beautiful, branded invoices with line items, taxes, and discounts
- **Multiple Payment Methods**: Support for Stripe, PayPal, Zelle, Wire Transfer, and more
- **Client Management**: Comprehensive client database with contact information
- **Public Invoice Links**: Secure, shareable links for client payments
- **PDF Generation**: Professional PDF invoices with paid receipts
- **Real-time Dashboard**: Analytics and insights into your business performance
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **jsPDF** for PDF generation
- **Vite** for development and building

### Backend (Planned)
- **Node.js** with Express.js
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Stripe & PayPal** for payment processing
- **SendGrid** for email notifications

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/solsonllc/royal-crm-invoice-portal.git
   cd royal-crm-invoice-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Default Login Credentials
- **Email**: admin@solsonllc.com
- **Password**: password123

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── InvoiceForm.tsx  # Invoice creation form
│   ├── InvoiceList.tsx  # Invoice management
│   ├── InvoiceView.tsx  # Invoice details view
│   ├── PublicInvoice.tsx # Public payment page
│   ├── ClientList.tsx   # Client management
│   ├── Layout.tsx       # App layout wrapper
│   └── Login.tsx        # Authentication
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── storage.ts       # Local storage management
│   └── pdfGenerator.ts  # PDF generation logic
└── index.css           # Global styles and Tailwind config
```

## 🎨 Design System

The application uses a royal-themed design system with:

- **Primary Colors**: Royal blue (#2563eb) and gold (#f59e0b)
- **Typography**: Inter for body text, Playfair Display for headings
- **Components**: Custom Tailwind components with consistent spacing and shadows
- **Animations**: Smooth transitions and micro-interactions

## 💳 Payment Integration

### Supported Payment Methods

1. **Credit/Debit Cards** (via Stripe)
   - Secure hosted checkout
   - Real-time payment processing
   - Automatic receipt generation

2. **PayPal**
   - PayPal account or guest checkout
   - International payment support

3. **Zelle**
   - Quick bank-to-bank transfers
   - Display payment instructions

4. **Wire Transfer/ACH**
   - Bank account details provided
   - Manual payment verification

5. **Additional Methods** (Configurable)
   - Venmo Business
   - Square
   - Custom payment methods

### Environment Variables Setup

Copy `.env.example` to `.env` and configure:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# PayPal Configuration  
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox

# Company Bank Information
BANK_NAME=Your Business Bank
BANK_ROUTING_NUMBER=123456789
BANK_ACCOUNT_NUMBER=1234567890

# Zelle Information
ZELLE_EMAIL=payments@solsonllc.com
ZELLE_PHONE=+1-555-123-4567
```

## 🔒 Security Features

- **Secure Invoice Links**: UUID-based public links prevent enumeration
- **Payment Gateway Integration**: No sensitive payment data stored locally
- **Input Validation**: Comprehensive form validation and sanitization
- **HTTPS Enforcement**: All payment processing over secure connections
- **Row-Level Security**: Database-level access controls (when using Supabase)

## 📊 Dashboard Analytics

The dashboard provides insights into:

- Total invoices and revenue
- Payment status breakdown
- Overdue invoice alerts
- Monthly growth metrics
- Recent activity feed

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Frontend invoice management
- ✅ Client management
- ✅ PDF generation
- ✅ Public payment pages

### Phase 2 (Backend Integration)
- 🔄 Supabase database integration
- 🔄 Real payment processing
- 🔄 Email notifications
- 🔄 Webhook handling

### Phase 3 (Advanced Features)
- 📋 Recurring invoices
- 📋 Multi-currency support
- 📋 Advanced reporting
- 📋 Client portal
- 📋 Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@solsonllc.com
- **Phone**: (555) 123-4567
- **Documentation**: [docs.solsonllc.com](https://docs.solsonllc.com)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)

---

**Solson LLC** - Professional Invoice Management Made Simple