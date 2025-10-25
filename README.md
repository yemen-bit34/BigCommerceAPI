# BigCommerce API Proxy

A production-ready Express.js backend service that provides a secure proxy for BigCommerce API operations, specifically designed for order management and approval workflows.

## 🚀 Features

- **Store Management**: Connect and manage multiple BigCommerce stores
- **Order Operations**: Fetch, view, and approve orders in bulk
- **Security**: Helmet CSP headers, CORS configuration, and secure token handling
- **Production Ready**: Graceful shutdown, error handling, and health checks
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **PM2 Support**: Process management with ecosystem configuration

## 🛠 Technologies

- **Node.js** with Express.js
- **BigCommerce API** integration
- **Docker** for containerization
- **PM2** for process management
- **Helmet** for security headers
- **Morgan** for request logging

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Docker (optional, for containerized deployment)
- BigCommerce store with API access

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd BigCoV2/BigCommerceAPI
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server:**

   ```bash
   npm start
   # or
   node server.js
   ```

4. **Access the API:**
   - API Base: `http://localhost:3000`
   - Health Check: `http://localhost:3000/health`

### Docker Deployment

1. **Build and run with Docker Compose:**

   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t bigcommerce-api .
   docker run -p 3000:3000 bigcommerce-api
   ```

## 🔧 Environment Variables

Create a `.env` file in the `BigCommerceAPI` directory:

```env
# Server Configuration
PORT=3000
CORS_ORIGIN=*

# Optional: Database Configuration (future enhancement)
# DATABASE_URL=postgresql://user:password@localhost:5432/bigcommerce_api

# Optional: Logging Configuration
# LOG_LEVEL=info
# LOG_FILE=./logs/app.log
```

## 📚 API Endpoints

### Store Management

- `POST /api/connect` - Connect a new BigCommerce store
- `GET /api/stores` - List all connected stores
- `DELETE /api/stores/:storeId` - Remove a store connection

### Order Operations

- `GET /api/stores/:storeId/orders` - Fetch orders from a store
- `PUT /api/stores/:storeId/orders/:orderId/approve` - Approve a single order
- `POST /api/stores/:storeId/orders/approve-all` - Bulk approve orders

### System

- `GET /health` - Health check endpoint
- `GET /` - Basic status endpoint

## 🔐 Security Notes

### ⚠️ CRITICAL SECURITY REQUIREMENTS

1. **API Token Security:**

   - Never commit real API tokens to version control
   - The `stores.json` file contains sensitive BigCommerce API tokens
   - If tokens were ever exposed, **rotate them immediately** in your BigCommerce admin panel

2. **Environment Configuration:**

   - Use environment variables for all sensitive configuration
   - The `.env` file is gitignored and should never be committed
   - Copy `.env.example` to `.env` and customize for your environment

3. **File Security:**

   - `stores.json` is gitignored and contains user-provided store connections
   - Each connection includes BigCommerce API tokens that should be treated as secrets
   - Consider encrypting this file in production environments

4. **Network Security:**
   - Configure CORS_ORIGIN appropriately for your deployment
   - Use HTTPS in production
   - Consider implementing rate limiting for production use

### Token Rotation Instructions

If your BigCommerce API tokens were exposed:

1. **Log into your BigCommerce admin panel**
2. **Navigate to:** Settings → API Accounts
3. **Find the exposed token** and click "Delete"
4. **Create a new API account** with the same permissions
5. **Update your store connections** using the new token via `/api/connect`

## 🚀 Deployment

### Production Deployment

1. **Environment Setup:**

   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export PORT=3000
   export CORS_ORIGIN=https://yourdomain.com
   ```

2. **Using PM2 (Recommended):**

   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Using Docker:**

   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

4. **Health Monitoring:**
   - Monitor `/health` endpoint
   - Set up log rotation
   - Configure process monitoring

### Docker Configuration

The project includes:

- `Dockerfile` for containerization
- `docker-compose.yml` for orchestration
- `ecosystem.config.js` for PM2 process management

## 📁 Project Structure

```
BigCoV2/
├── BigCommerceAPI/
│   ├── src/
│   │   ├── api/           # API route handlers
│   │   ├── components/    # Frontend components
│   │   └── processing/    # Order processing logic
│   ├── dist/              # Built frontend assets
│   ├── public/            # Static assets
│   ├── server.js          # Main Express server
│   ├── stores.json        # Store connections (gitignored)
│   ├── .env.example       # Environment template
│   ├── .gitignore         # Git ignore rules
│   └── package.json       # Dependencies
├── docker-compose.yml     # Docker orchestration
├── Dockerfile            # Container definition
├── ecosystem.config.js   # PM2 configuration
├── LICENSE               # MIT License
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Check the [API documentation](#-api-endpoints)
2. Review the [security notes](#-security-notes)
3. Open an issue in the repository

---

**⚠️ Remember:** Always keep your BigCommerce API tokens secure and never commit them to version control!
