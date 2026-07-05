-- HR-Engine Central Schema Definition
CREATE SCHEMA IF NOT EXISTS "HR-Engine";
SET search_path TO "HR-Engine";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NULL,
    domain VARCHAR(255) UNIQUE NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'starter',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
    feature_talent_mgmt BOOLEAN NOT NULL DEFAULT TRUE,
    feature_hr_team BOOLEAN NOT NULL DEFAULT TRUE,
    feature_resource_mgmt BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);

-- Users Table (Credentials & Roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE(email)
);
CREATE INDEX idx_users_org ON users(organization_id);

-- Support Tickets (Nexus Operations)
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_support_tickets_org ON support_tickets(organization_id);
