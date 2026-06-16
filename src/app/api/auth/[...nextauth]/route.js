import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://')
const cookiePrefix = useSecureCookies ? '__Secure-' : ''
const hostName = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000')
  .hostname

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashPassword) {
          throw new Error('Email ou mot de passe incorrect')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashPassword,
        )

        if (!isPasswordValid) {
          throw new Error('Email ou mot de passe incorrect')
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // ✅ COOKIES - Configuration explicite pour production
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: hostName === 'localhost' ? 'localhost' : `.${hostName}`,
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: hostName === 'localhost' ? 'localhost' : `.${hostName}`,
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: hostName === 'localhost' ? 'localhost' : `.${hostName}`,
        secure: useSecureCookies,
      },
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/verify',
    newUser: '/',
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })
        if (dbUser) {
          token.id = dbUser.id.toString()
          token.role = dbUser.role
        }
      }

      if (trigger === 'update' && session) {
        token.name = session.user.name
        token.email = session.user.email
      }

      if (token.email && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true, name: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.name = dbUser.name
          }
        } catch (error) {
          console.error('Erreur refresh token:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },

    async signIn({ user, account, profile }) {
      return true
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('✅ Connexion:', user.email, 'role:', user.role || 'user')
      if (isNewUser) {
        console.log('🆕 Nouvel utilisateur créé')
      }
    },
    async signOut({ token, session }) {
      console.log('👋 Déconnexion')
    },
  },

  // ✅ Debug en development uniquement
  debug: process.env.NODE_ENV === 'development',

  // ✅ Secret obligatoire
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Trust host en production Vercel
  trustHost: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// import NextAuth from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import bcrypt from 'bcryptjs'
// import prisma from '@/lib/prisma'

// export const authOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     // Google OAuth
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),

//     // Email/Password
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email et mot de passe requis')
//         }

//         // Trouver l'utilisateur
//         const user = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//         })

//         if (!user || !user.hashPassword) {
//           throw new Error('Email ou mot de passe incorrect')
//         }

//         // Vérifier le mot de passe
//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.hashPassword,
//         )

//         if (!isPasswordValid) {
//           throw new Error('Email ou mot de passe incorrect')
//         }

//         return {
//           id: user.id.toString(),
//           email: user.email,
//           name: user.name,
//           image: user.image,
//           role: user.role, // ✅ IMPORTANT
//         }
//       },
//     }),
//   ],

//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 jours
//   },

//   pages: {
//     signIn: '/login',
//     signOut: '/',
//     error: '/login',
//     verifyRequest: '/verify',
//     newUser: '/dashboard',
//   },

//   callbacks: {
//     async jwt({ token, user, account, trigger, session }) {
//       // ✅ Première connexion (login)
//       if (user) {
//         token.id = user.id
//         token.role = user.role
//         token.email = user.email
//         token.name = user.name
//         token.picture = user.image
//       }

//       // ✅ OAuth (Google)
//       if (account?.provider === 'google') {
//         const dbUser = await prisma.user.findUnique({
//           where: { email: token.email },
//         })
//         if (dbUser) {
//           token.id = dbUser.id.toString()
//           token.role = dbUser.role
//         }
//       }

//       // ✅ Update session (quand on change le profil)
//       if (trigger === 'update' && session) {
//         token.name = session.user.name
//         token.email = session.user.email
//         // On peut aussi mettre à jour d'autres champs si besoin
//       }

//       // ✅ IMPORTANT : Rafraîchir le role depuis la DB périodiquement
//       // Cela permet de détecter si un admin devient user (ou inversement)
//       if (token.email && !user) {
//         try {
//           const dbUser = await prisma.user.findUnique({
//             where: { email: token.email },
//             select: { role: true, name: true },
//           })

//           if (dbUser) {
//             token.role = dbUser.role // ✅ Mettre à jour le role
//             token.name = dbUser.name
//           }
//         } catch (error) {
//           console.error('Erreur refresh token:', error)
//         }
//       }

//       return token
//     },

//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id
//         session.user.role = token.role // ✅ IMPORTANT
//         session.user.email = token.email
//         session.user.name = token.name
//         session.user.image = token.picture
//       }
//       return session
//     },

//     async signIn({ user, account, profile }) {
//       // Pour Google OAuth
//       if (account?.provider === 'google') {
//         // Vérifier si l'utilisateur existe
//         const existingUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         })

//         // Si l'utilisateur n'existe pas, il sera créé automatiquement par PrismaAdapter
//         // Le role par défaut sera "user" (défini dans le schéma Prisma)

//         return true
//       }

//       return true
//     },
//   },

//   events: {
//     async signIn({ user, account, profile, isNewUser }) {
//       console.log(`✅ Connexion: ${user.email} (role: ${user.role || 'user'})`)
//       if (isNewUser) {
//         console.log('🆕 Nouvel utilisateur créé')
//       }
//     },
//     async signOut({ token, session }) {
//       console.log('👋 Déconnexion')
//     },
//   },

//   debug: process.env.NODE_ENV === 'development',
//   secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
