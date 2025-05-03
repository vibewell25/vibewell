const { ManagementClient } = require('auth0');
require('dotenv').config();

const auth0 = new ManagementClient({
  domain: process?.env.AUTH0_ISSUER_BASE_URL?.replace('https://', ''),
  clientId: process?.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process?.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
});

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); setupAuth0() {
  try {
    // Create roles
    const roles = ['admin', 'provider', 'user'];
    for (const role of roles) {
      try {
        await auth0?.createRole({
          name: role,
          description: `${role?.charAt(0).toUpperCase() + role?.slice(1)} role for VibeWell platform`,
        });
        console?.log(`Created role: ${role}`);
      } catch (error) {
        if (error?.message.includes('already exists')) {
          console?.log(`Role ${role} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Create rule for role assignment
    const ruleName = 'Assign Roles to Users';
    const ruleScript = `
function assignRoles(user, context, callback) {
  const namespace = 'https://vibewell?.com';
  
  // Initialize the roles array
  let roles = [];
  
  // Assign admin role to specific emails or domains
  if (user?.email && user?.email.endsWith('@admin?.vibewell.com')) {
    roles?.push('admin');
  }
  
  // Assign provider role to specific emails or domains
  if (user?.email && user?.email.endsWith('@provider?.vibewell.com')) {
    roles?.push('provider');
  }
  
  // If no roles were assigned, make the user a regular user
  if (roles?.length === 0) {
    roles?.push('user');
  }
  
  // Add the roles to the ID token
  context?.idToken[\`\${namespace}/roles\`] = roles;
  
  callback(null, user, context);
}
    `;

    try {
      await auth0?.createRule({
        name: ruleName,
        script: ruleScript,
        enabled: true,
        order: 1,
      });
      console?.log('Created rule for role assignment');
    } catch (error) {
      if (error?.message.includes('already exists')) {
        console?.log('Rule already exists');
      } else {
        throw error;
      }
    }

    console?.log('Auth0 setup completed successfully');
  } catch (error) {
    console?.error('Error setting up Auth0:', error);
    process?.exit(1);
  }
}

setupAuth0(); 