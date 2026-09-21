import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        const emailLower = credentials.email.toLowerCase().trim();

        // Preset Travel Owner / Operator accounts for instant access and testing
        if (emailLower === 'kpn@travelowner.com' && credentials.password === 'Kpn@1234') {
          return {
            id: 'owner-kpn-01',
            name: 'K. P. Natarajan',
            email: emailLower,
            role: 'TRAVEL_OWNER',
            operatorName: 'KPN Travels',
          };
        }

        if (emailLower === 'vrl@travelowner.com' && credentials.password === 'Vrl@1234') {
          return {
            id: 'owner-vrl-02',
            name: 'Vijay Sankeshwar',
            email: emailLower,
            role: 'TRAVEL_OWNER',
            operatorName: 'VRL Travels',
          };
        }

        if (emailLower === 'parveen@travelowner.com' && credentials.password === 'Parveen@1234') {
          return {
            id: 'owner-parveen-03',
            name: 'A. Afzal',
            email: emailLower,
            role: 'TRAVEL_OWNER',
            operatorName: 'Parveen Travels',
          };
        }

        if (emailLower === 'owner@nextbus.com' && credentials.password === 'Owner@1234') {
          return {
            id: 'owner-nextbus-00',
            name: 'Fleet Operator',
            email: emailLower,
            role: 'TRAVEL_OWNER',
            operatorName: 'KPN Travels',
          };
        }

        // Dynamic administration credentials fallback and registration
        if (emailLower === 'ajairaja2004@gmail.com' && credentials.password === 'R@jasekar2004') {
          let user = await prisma.user.findUnique({
            where: { email: emailLower },
          });

          if (!user) {
            const passwordHash = await bcrypt.hash('R@jasekar2004', 12);
            user = await prisma.user.create({
              data: {
                name: 'Ajai Raja (Admin)',
                email: emailLower,
                password: passwordHash,
                role: 'ADMIN',
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: emailLower },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        // Check if user is registered as Travel Owner in global registry
        const globalStore = globalThis;
        const registeredOwner = globalStore.__TRAVEL_OWNERS__?.[emailLower];
        const effectiveRole = registeredOwner ? 'TRAVEL_OWNER' : user.role;
        const operatorName = registeredOwner ? registeredOwner.companyName : (user.role === 'TRAVEL_OWNER' ? user.name : undefined);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: effectiveRole,
          operatorName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.operatorName = user.operatorName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.operatorName = token.operatorName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
};
