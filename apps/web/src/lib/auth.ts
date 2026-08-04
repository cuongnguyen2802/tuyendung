import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import axios from 'axios'

const ACCESS_TOKEN_TTL = 55 * 60 // 55 minutes in seconds (matches 1h access token with 5-min buffer)

async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await axios.post(`${process.env.API_URL}/api/v1/auth/refresh`, { refreshToken })
    const { accessToken, refreshToken: newRefreshToken } = res.data.data
    return { accessToken, refreshToken: newRefreshToken ?? refreshToken, error: null }
  } catch {
    return { accessToken: null, refreshToken: null, error: 'RefreshTokenError' }
  }
}

const oauthProviders = [
  ...(process.env.GOOGLE_CLIENT_ID
    ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
    : []),
  ...(process.env.FACEBOOK_APP_ID
    ? [FacebookProvider({ clientId: process.env.FACEBOOK_APP_ID!, clientSecret: process.env.FACEBOOK_APP_SECRET! })]
    : []),
  ...(process.env.LINKEDIN_CLIENT_ID
    ? [LinkedInProvider({ clientId: process.env.LINKEDIN_CLIENT_ID!, clientSecret: process.env.LINKEDIN_CLIENT_SECRET! })]
    : []),
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.API_URL}/api/v1/auth/login`,
            { email: credentials?.email, password: credentials?.password },
          )
          const { accessToken, refreshToken } = res.data.data
          const meRes = await axios.get(`${process.env.API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const user = meRes.data.data
          return { ...user, accessToken, refreshToken }
        } catch (err: any) {
          const code = err?.code ?? err?.cause?.code
          if (
            code === 'ECONNREFUSED' ||
            code === 'ECONNRESET' ||
            code === 'ENOTFOUND' ||
            code === 'ETIMEDOUT' ||
            err?.message?.includes('ECONNREFUSED')
          ) {
            throw new Error('SERVER_UNAVAILABLE')
          }
          return null
        }
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // First sign-in via credentials
      if (user && account?.provider === 'credentials') {
        const u = user as any
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          role: u.role,
          id: u.id,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL * 1000,
        }
      }

      // First sign-in via OAuth (Google / Facebook / LinkedIn)
      if (user && account && account.provider !== 'credentials') {
        try {
          const res = await axios.post(`${process.env.API_URL}/api/v1/auth/oauth`, {
            provider: account.provider,
            providerId: account.providerAccountId,
            email: user.email,
            name: user.name,
            avatar: user.image,
          })
          const { accessToken, refreshToken } = res.data.data
          const meRes = await axios.get(`${process.env.API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const me = meRes.data.data
          return {
            ...token,
            accessToken,
            refreshToken,
            role: me.role,
            id: me.id,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL * 1000,
          }
        } catch {
          return { ...token, error: 'OAuthError' }
        }
      }

      // Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token expired — refresh it
      const refreshed = await refreshAccessToken(token.refreshToken as string)
      if (refreshed.error) {
        return { ...token, error: 'RefreshTokenError' }
      }
      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL * 1000,
        error: null,
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.role = token.role as string
      session.user.id = token.id as string
      ;(session as any).error = token.error
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: { id: string; role: string; email: string; name?: string | null; image?: string | null }
  }
}
