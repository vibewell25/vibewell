const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Options for JWT strategy
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        // If user exists, return the user
        if (user) {
          return done(null, user);
        }

        // If user doesn't exist, return false
        return done(null, false);
      } catch (error) {
        console.error('Passport error:', error);
        return done(error, false);
      }
    })
  );
}; 