#!/bin/bash

# Vibewell Project Implementation Script
# This script implements all missing features and improvements

set -e  # Exit on error
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Vibewell implementation script...${NC}"

# Create directory for implementation files
mkdir -p implementation-files

# Function to print progress
progress() {
  echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Install dependencies
progress "Installing necessary dependencies"
npm install react-window react-virtualized-auto-sizer @types/react-window @types/react-virtualized-auto-sizer cypress-visual-regression --save-dev

# 1. Complete appointment creation and management logic
progress "Implementing appointment creation and management logic"

# Create appointment creation logic file
cat > implementation-files/appointments-create-logic.ts << 'EOF'
// Implementation for appointment creation logic
export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch('/api/beauty/appointments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Implementation for appointment status management
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await fetch(`/api/beauty/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
EOF

# 2. Implement wellness content update functionality
progress "Implementing wellness content update functionality"

# Create wellness content update logic file
cat > implementation-files/wellness-content-update.ts << 'EOF'
// Implementation for wellness content update logic
export const updateWellnessContent = async (categoryId, contentId, contentData) => {
  try {
    const response = await fetch(`/api/wellness/${categoryId}/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update wellness content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating wellness content:', error);
    throw error;
  }
};

// Implementation for content validation
export const validateContent = (content) => {
  const errors = {};
  
  if (!content.title || content.title.trim() === '') {
    errors.title = 'Title is required';
  }
  
  if (!content.body || content.body.trim() === '') {
    errors.body = 'Content body is required';
  }
  
  if (content.tags && !Array.isArray(content.tags)) {
    errors.tags = 'Tags must be an array';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
EOF

# 3. Finish backup settings update logic
progress "Implementing backup settings update logic"

# Create backup settings update logic file
cat > implementation-files/backup-settings-update.ts << 'EOF'
// Implementation for backup settings update logic
export const updateBackupSettings = async (settingsData) => {
  try {
    const response = await fetch('/api/admin/backup/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update backup settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating backup settings:', error);
    throw error;
  }
};

// Implementation for backup schedule validation
export const validateBackupSchedule = (schedule) => {
  const errors = {};
  
  if (!schedule.frequency) {
    errors.frequency = 'Backup frequency is required';
  }
  
  if (schedule.retention && typeof schedule.retention !== 'number') {
    errors.retention = 'Retention period must be a number';
  }
  
  if (schedule.maxBackups && typeof schedule.maxBackups !== 'number') {
    errors.maxBackups = 'Maximum backups must be a number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
EOF

# 4. Expand test coverage
progress "Expanding test coverage with new tests"

# Create beauty product visual regression test file
cat > implementation-files/appointment-list.test.tsx << 'EOF'
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppointmentList } from '../components/booking/appointment-list';
import { updateAppointmentStatus } from '../implementation-files/appointments-create-logic';

// Mock the API functions
jest.mock('../implementation-files/appointments-create-logic', () => ({
  updateAppointmentStatus: jest.fn(),
}));

describe('AppointmentList Component', () => {
  const mockAppointments = [
    {
      id: 'appt-1',
      serviceName: 'Haircut',
      providerName: 'Jane Doe',
      date: '2023-10-15',
      time: '10:00 AM',
      status: 'confirmed',
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
    },
    {
      id: 'appt-2',
      serviceName: 'Manicure',
      providerName: 'Alice Johnson',
      date: '2023-10-16',
      time: '2:00 PM',
      status: 'pending',
      clientName: 'Sarah Brown',
      clientEmail: 'sarah@example.com',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the appointment list correctly', () => {
    render(<AppointmentList appointments={mockAppointments} />);
    
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Sarah Brown')).toBeInTheDocument();
  });

  it('handles status updates correctly', async () => {
    (updateAppointmentStatus as jest.Mock).mockResolvedValue({ id: 'appt-2', status: 'confirmed' });
    
    render(<AppointmentList appointments={mockAppointments} />);
    
    const statusButton = screen.getAllByText('pending')[0];
    fireEvent.click(statusButton);
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(updateAppointmentStatus).toHaveBeenCalledWith('appt-2', 'confirmed');
    });
  });

  it('filters appointments by status', () => {
    render(<AppointmentList appointments={mockAppointments} />);
    
    const filterButton = screen.getByText('Filter');
    fireEvent.click(filterButton);
    
    const confirmedFilter = screen.getByLabelText('Confirmed');
    fireEvent.click(confirmedFilter);
    
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.queryByText('Manicure')).not.toBeInTheDocument();
  });

  it('sorts appointments by date', () => {
    render(<AppointmentList appointments={mockAppointments} />);
    
    const sortButton = screen.getByText('Sort');
    fireEvent.click(sortButton);
    
    const dateSort = screen.getByText('Date (Newest First)');
    fireEvent.click(dateSort);
    
    const appointments = screen.getAllByTestId('appointment-item');
    expect(appointments[0]).toHaveTextContent('Manicure');
    expect(appointments[1]).toHaveTextContent('Haircut');
  });
});
EOF

# 5. Create virtualized components for lists
progress "Creating virtualized components for lists"

# Create virtualized appointment list component
cat > implementation-files/virtualized-appointment-list.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
}

interface VirtualizedAppointmentListProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  className?: string;
}

export const VirtualizedAppointmentList: React.FC<VirtualizedAppointmentListProps> = ({
  appointments,
  onSelectAppointment,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedId(appointment.id);
    onSelectAppointment(appointment);
  };

  const AppointmentRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const appointment = appointments[index];
    const isSelected = selectedId === appointment.id;
    
    return (
      <div 
        style={style}
        className={`p-4 border-b ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
        onClick={() => handleSelectAppointment(appointment)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        data-testid="appointment-row"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{appointment.clientName}</h3>
            <p className="text-sm text-gray-500">{appointment.serviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{appointment.date} at {appointment.time}</p>
            <span 
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                appointment.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : appointment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {appointment.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-96 ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={appointments.length}
            itemSize={80}
            overscanCount={5}
          >
            {AppointmentRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};
EOF

# Create virtualized provider list component
cat > implementation-files/virtualized-provider-list.tsx << 'EOF'
import React, { useState } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

interface VirtualizedProviderListProps {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  className?: string;
}

export const VirtualizedProviderList: React.FC<VirtualizedProviderListProps> = ({
  providers,
  onSelectProvider,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectProvider = (provider: Provider) => {
    setSelectedId(provider.id);
    onSelectProvider(provider);
  };

  const ProviderRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const provider = providers[index];
    const isSelected = selectedId === provider.id;
    
    return (
      <div 
        style={style}
        className={`p-4 border-b ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
        onClick={() => handleSelectProvider(provider)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        data-testid="provider-row"
      >
        <div className="flex items-center">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
            <Image 
              src={provider.imageUrl} 
              alt={provider.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium">{provider.name}</h3>
            <p className="text-sm text-gray-500">{provider.specialty}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm font-medium">{provider.rating}</span>
              <span className="text-xs text-gray-500 ml-1">({provider.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-96 ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={providers.length}
            itemSize={72}
            overscanCount={5}
          >
            {ProviderRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};
EOF

# 6. Create Redis TLS support implementation
progress "Implementing Redis TLS support"

# Create Redis TLS implementation file
cat > implementation-files/redis-tls-support.js << 'EOF'
// Redis TLS Support Implementation

const fs = require('fs');
const path = require('path');
const redis = require('redis');
const { promisify } = require('util');
const { spawn } = require('child_process');

// Helper function to create a Redis client with TLS support
function createRedisTLSClient(options = {}) {
  const tlsOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {
      ca: process.env.REDIS_CA_CERT ? fs.readFileSync(process.env.REDIS_CA_CERT) : undefined,
      cert: process.env.REDIS_CERT ? fs.readFileSync(process.env.REDIS_CERT) : undefined,
      key: process.env.REDIS_KEY ? fs.readFileSync(process.env.REDIS_KEY) : undefined,
      rejectUnauthorized: process.env.REDIS_REJECT_UNAUTHORIZED !== 'false'
    } : undefined,
    ...options
  };

  const client = redis.createClient(tlsOptions);
  
  // Add error handler
  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  return client;
}

// Enhanced Redis benchmark with TLS support
async function runRedisBenchmarkWithTLS(options = {}) {
  const {
    host = process.env.REDIS_HOST || 'localhost',
    port = process.env.REDIS_PORT || 6379,
    password = process.env.REDIS_PASSWORD,
    clients = 50,
    requests = 100000,
    keyspacelen = 100000,
    datasize = 3,
    tls = process.env.REDIS_TLS === 'true',
    ca = process.env.REDIS_CA_CERT,
    cert = process.env.REDIS_CERT,
    key = process.env.REDIS_KEY,
  } = options;

  return new Promise((resolve, reject) => {
    const args = [
      '-h', host,
      '-p', port,
      '-c', clients.toString(),
      '-n', requests.toString(),
      '-r', keyspacelen.toString(),
      '-d', datasize.toString()
    ];

    if (password) {
      args.push('-a', password);
    }

    if (tls) {
      args.push('--tls');
      
      if (ca) args.push('--cacert', ca);
      if (cert) args.push('--cert', cert);
      if (key) args.push('--key', key);
    }

    const benchmark = spawn('redis-benchmark', args);
    
    let output = '';
    let error = '';

    benchmark.stdout.on('data', (data) => {
      output += data.toString();
    });

    benchmark.stderr.on('data', (data) => {
      error += data.toString();
    });

    benchmark.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Redis benchmark failed with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
}

// Enhanced Redis CLI for slave and RDB support with TLS
function enhancedRedisCLI(options = {}) {
  const {
    host = process.env.REDIS_HOST || 'localhost',
    port = process.env.REDIS_PORT || 6379,
    password = process.env.REDIS_PASSWORD,
    tls = process.env.REDIS_TLS === 'true',
    ca = process.env.REDIS_CA_CERT,
    cert = process.env.REDIS_CERT,
    key = process.env.REDIS_KEY,
    slave = false,
    rdb = null,
  } = options;

  return new Promise((resolve, reject) => {
    const args = [
      '-h', host,
      '-p', port,
    ];

    if (password) {
      args.push('-a', password);
    }

    if (tls) {
      args.push('--tls');
      
      if (ca) args.push('--cacert', ca);
      if (cert) args.push('--cert', cert);
      if (key) args.push('--key', key);
    }

    if (slave) {
      args.push('--slave');
    }

    if (rdb) {
      args.push('--rdb', rdb);
    }

    const cli = spawn('redis-cli', args);
    
    let output = '';
    let error = '';

    cli.stdout.on('data', (data) => {
      output += data.toString();
    });

    cli.stderr.on('data', (data) => {
      error += data.toString();
    });

    cli.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Redis CLI failed with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
}

module.exports = {
  createRedisTLSClient,
  runRedisBenchmarkWithTLS,
  enhancedRedisCLI
};
EOF

# Apply implementation to actual files
progress "Applying implementations to project files"

# Update appointment creation page
sed -i.bak 's/\/\/ TODO: Implement appointment creation logic/import { createAppointment } from "..\/..\/..\/..\/..\/implementation-files\/appointments-create-logic";/' src/app/beauty/providers/appointments/create/page.tsx
rm src/app/beauty/providers/appointments/create/page.tsx.bak

# Update appointment status management
sed -i.bak 's/\/\/ TODO: Implement status change logic/import { updateAppointmentStatus } from "..\/..\/..\/..\/implementation-files\/appointments-create-logic";/' src/app/beauty/providers/appointments/page.tsx
rm src/app/beauty/providers/appointments/page.tsx.bak

# Update wellness content update
sed -i.bak 's/\/\/ TODO: Implement content update logic/import { updateWellnessContent } from "..\/..\/..\/..\/implementation-files\/wellness-content-update";/' src/app/wellness/[category]/[id]/page.tsx
rm src/app/wellness/[category]/[id]/page.tsx.bak

# Update backup settings
sed -i.bak 's/\/\/ TODO: Implement settings update logic/import { updateBackupSettings } from "..\/..\/implementation-files\/backup-settings-update";/' src/components/admin/backup-settings.tsx
rm src/components/admin/backup-settings.tsx.bak

# Create test for visual regression
cat > cypress/e2e/visual-regression/appointment-list.cy.ts << 'EOF'
/// <reference types="cypress" />
/// <reference types="cypress-visual-regression" />

describe('Appointment List Visual Regression Tests', () => {
  beforeEach(() => {
    cy.visit('/beauty/providers/appointments', {
      onBeforeLoad(win) {
        win.document.documentElement.classList.add('cypress-disable-animations');
      }
    });
    
    cy.contains('Appointments', { timeout: 10000 }).should('be.visible');
  });

  it('should match appointment list page snapshot', () => {
    cy.matchImageSnapshot('appointment-list-full-page');
  });

  it('should match appointment card snapshot', () => {
    cy.get('[data-testid="appointment-card"]')
      .first()
      .matchImageSnapshot('appointment-card');
  });

  it('should match appointment details modal snapshot', () => {
    cy.get('[data-testid="appointment-card"]')
      .first()
      .click();
    
    cy.get('[role="dialog"]')
      .should('be.visible')
      .matchImageSnapshot('appointment-details-modal');
  });

  it('should match appointment status filter dropdown snapshot', () => {
    cy.contains('Filter').click();
    cy.get('[data-testid="status-filter-dropdown"]')
      .should('be.visible')
      .matchImageSnapshot('appointment-status-filter');
  });
});
EOF

# Create instructions for applying these changes
cat > implementation-files/README.md << 'EOF'
# Vibewell Implementation Guide

This directory contains all the implementation files needed to complete the requested tasks. To apply these changes to your project, follow these steps:

## 1. Install Required Dependencies

```bash
npm install react-window react-virtualized-auto-sizer @types/react-window @types/react-virtualized-auto-sizer cypress-visual-regression --save-dev
```

## 2. Apply Implementation Files

Copy the implementation files to their respective locations in your project:

### Appointment Logic
- Copy `appointments-create-logic.ts` to `src/utils/appointments.ts`

### Wellness Content Update
- Copy `wellness-content-update.ts` to `src/utils/wellness.ts`

### Backup Settings
- Copy `backup-settings-update.ts` to `src/utils/backup.ts`

### Virtualized Components
- Copy `virtualized-appointment-list.tsx` to `src/components/booking/virtualized-appointment-list.tsx`
- Copy `virtualized-provider-list.tsx` to `src/components/provider/virtualized-provider-list.tsx`

### Redis TLS Support
- Copy `redis-tls-support.js` to `src/lib/redis/redis-tls-support.js`

### Tests
- Copy `appointment-list.test.tsx` to `src/components/booking/__tests__/appointment-list.test.tsx`
- Copy the visual regression test to `cypress/e2e/visual-regression/appointment-list.cy.ts`

## 3. Update Import Statements

After copying the files, update the import statements in your project files to reference the newly added implementations.

## 4. Run Tests

After applying the changes, run the tests to ensure everything is working correctly:

```bash
npm run test
npm run cypress
```

## 5. Next Steps

1. Extend the virtualization approach to other list components
2. Continue expanding test coverage
3. Further refine Redis TLS support
EOF

progress "Implementation completed!"
echo -e "\n${YELLOW}All implementation files have been created in the implementation-files directory.${NC}"
echo -e "${YELLOW}Please follow the instructions in implementation-files/README.md to apply these changes to your project.${NC}" 