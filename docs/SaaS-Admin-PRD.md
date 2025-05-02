# StageMate AI - SaaS Administration PRD

## Product Overview

StageMate AI is a SaaS platform that enables real estate agents to transform ordinary room photos into professionally staged images using AI technology. This PRD outlines the administration features required to effectively manage the SaaS platform.

## User Roles

### Admin
- Full access to all platform features and administration tools
- Can manage users, subscriptions, and content
- Can view analytics and reports

### User
- Access to AI image transformation features
- Can manage their own listings and images
- Limited to their subscription plan features

## Admin Dashboard Features

### 1. Admin Dashboard Overview

**Purpose:** Provide a high-level view of platform performance and key metrics.

**Requirements:**
- Display key metrics: total users, active subscriptions, total listings, credits used
- Quick access to user management, analytics, and subscription management
- Real-time updates of platform status

**Implementation:**
- Dashboard located at `/admin` route
- Authentication check to ensure only admin users can access
- Responsive design for desktop and mobile access

### 2. User Management

**Purpose:** Allow administrators to view and manage all users on the platform.

**Requirements:**
- View all registered users with key information (email, sign-up date, last login)
- Filter and search users by email, plan type, and other attributes
- Edit user details including credits, plan type, and admin status
- Activate/deactivate user accounts

**Implementation:**
- User management page at `/admin/users` route
- Table view with pagination for large user bases
- Modal interface for editing user details
- Secure role management for admin privileges

### 3. Analytics Dashboard

**Purpose:** Provide detailed insights into platform usage and performance.

**Requirements:**
- Display user growth trends over time (daily, weekly, monthly)
- Track listing creation and AI transformations
- Monitor credit usage across the platform
- Analyze subscription plan distribution

**Implementation:**
- Analytics dashboard at `/admin/analytics` route
- Interactive charts and graphs for data visualization
- Time range selection for different analysis periods
- Export functionality for reports

### 4. Subscription Management

**Purpose:** Manage subscription plans, pricing, and features.

**Requirements:**
- Create, edit, and manage subscription plans
- Set pricing, credit allocations, and features for each plan
- Activate/deactivate subscription plans
- View subscription metrics and conversion rates

**Implementation:**
- Subscription management at `/admin/subscriptions` route
- Interface for creating and editing plans
- Feature management for each subscription tier
- Status toggles for plan availability

## Database Schema

### admin_users
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- created_at: timestamp

### subscription_plans
- id: UUID (primary key)
- name: string
- description: string
- price: decimal
- credits: integer
- features: string array
- is_active: boolean
- created_at: timestamp

### user_usage
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- credits_remaining: integer
- credits_used: integer
- plan_type: string
- updated_at: timestamp

### credit_usage_logs
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- credits_used: integer
- action_type: string
- created_at: timestamp

## Security Considerations

- Admin routes must be protected with proper authentication and authorization
- Role-based access control to prevent unauthorized access
- Audit logging for sensitive admin actions
- Input validation and sanitization for all admin forms
- Protection against CSRF and XSS attacks

## Future Enhancements

- Advanced reporting and export capabilities
- Billing management and invoice generation
- User communication tools (email notifications, announcements)
- A/B testing framework for subscription plans
- Customizable dashboard widgets for admins

## Implementation Timeline

1. **Phase 1 (Completed):**
   - Admin dashboard overview
   - Basic user management
   - Analytics dashboard
   - Subscription plan management

2. **Phase 2 (Future):**
   - Advanced analytics and reporting
   - Billing integration
   - User communication tools
   - Content moderation tools

3. **Phase 3 (Future):**
   - Custom dashboard builder
   - Advanced security features
   - API access management
   - White-label options for enterprise clients
