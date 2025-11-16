# GlamBooking WordPress Plugin - Installation Guide

## 📦 Plugin Package
**File:** `glambooking.zip`  
**Version:** 1.0.0  
**Location:** `d:\Glammy\glambooking-wordpress-plugin\glambooking.zip`

## 🚀 Installation Steps

### 1. Upload to WordPress
1. Log in to your WordPress admin panel
2. Navigate to **Plugins → Add New**
3. Click **Upload Plugin**
4. Choose `glambooking.zip`
5. Click **Install Now**
6. Click **Activate Plugin**

### 2. Configure API Keys
1. Go to **GlamBooking → Settings** in WordPress admin
2. Enter your API credentials:
   - **Public Key**: Your GlamBooking public API key
   - **Secret Key**: Your GlamBooking secret API key
   - **Business ID**: Your GlamBooking business ID
3. Click **Save Settings**
4. Click **Test Connection** to verify

## 📝 Usage Methods

### Method 1: Shortcode (Easiest)
Add this shortcode to any page or post:
```
[glambooking]
```

**With options:**
```
[glambooking business="your-business-id" service="facials" theme="minimal" height="700px"]
```

### Method 2: Gutenberg Block
1. Edit a page/post in Gutenberg editor
2. Click **+** to add a block
3. Search for "GlamBooking"
4. Configure the block settings in the sidebar
5. Publish

### Method 3: Elementor Widget
1. Edit a page with Elementor
2. Search for "GlamBooking" in the widget panel
3. Drag the widget to your page
4. Configure settings in the left panel
5. Update

## 🎨 Customization Options

### Available Parameters
- `business`: Business ID (optional if set in settings)
- `service`: Pre-select a service category
- `theme`: `default`, `minimal`, or `dark`
- `height`: Widget height (e.g., `600px`, `700px`)

### Example Shortcodes
```
[glambooking theme="dark" height="800px"]
[glambooking service="haircut" theme="minimal"]
[glambooking business="custom-business-id"]
```

## 🔧 Features

### Admin Dashboard
- View recent bookings
- Quick stats overview
- Direct link to full GlamBooking dashboard

### Bookings Page
- List all bookings
- Filter by status
- View booking details
- Quick actions

### Analytics Page
- Revenue charts
- Booking trends
- Client growth
- Popular services

### Settings Page
- API configuration
- Connection testing
- Business information
- Widget customization

## 🌐 Booking Page URL
Your booking page will be embedded from:
```
https://book.glambooking.co.uk/business/[your-business-slug]
```

## 📋 Requirements
- WordPress 5.8 or higher
- PHP 7.4 or higher
- Active GlamBooking account
- Valid API credentials

## 🔐 Security
- API keys are stored securely in WordPress options
- All API requests are authenticated
- Tokens are cached for 23 hours
- HTTPS required for production

## 🐛 Troubleshooting

### Widget Not Showing
1. Check API credentials in Settings
2. Click "Test Connection"
3. Verify Business ID is correct
4. Check browser console for errors

### Connection Failed
1. Verify API keys are correct
2. Ensure GlamBooking backend is running
3. Check firewall/security settings
4. Try regenerating API keys

### Styling Issues
1. Clear WordPress cache
2. Clear browser cache
3. Check theme compatibility
4. Adjust height parameter

## 📞 Support
- Documentation: https://docs.glambooking.co.uk
- Support: support@glambooking.co.uk
- Dashboard: https://beauticians.glambooking.co.uk

## 📄 File Structure
```
glambooking/
├── glambooking.php          # Main plugin file
├── readme.txt               # WordPress plugin readme
├── admin/                   # Admin pages
│   ├── dashboard.php
│   ├── bookings.php
│   ├── analytics.php
│   ├── settings.php
│   ├── css/admin.css
│   └── js/admin.js
├── includes/                # Core functionality
│   ├── api-client.php       # API communication
│   ├── auth.php             # Authentication
│   ├── elementor-widget.php # Elementor integration
│   ├── gutenberg-block.php  # Gutenberg block
│   └── block.js             # Block editor script
└── public/                  # Frontend
    ├── shortcode.php        # Shortcode handler
    ├── css/public.css       # Frontend styles
    └── js/booking-widget.js # Widget functionality
```

## 🔄 Updates
To update the plugin:
1. Deactivate the current version
2. Delete the old plugin
3. Upload and activate the new version
4. API settings will be preserved

## ✅ Testing Checklist
- [ ] Plugin activates without errors
- [ ] API connection successful
- [ ] Shortcode displays booking widget
- [ ] Gutenberg block works
- [ ] Elementor widget works
- [ ] Admin dashboard loads
- [ ] Bookings page shows data
- [ ] Analytics page displays charts
- [ ] Settings save correctly

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-16  
**Author:** TSVWEB.co.uk
