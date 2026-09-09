import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // 📝 This defines what data fields you want to collect
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 🔒 This is where your backend logic checks the user
        // Mock check for testing:
        if (credentials?.email === "admin@test.com" && credentials?.password === "password123") {
          return { id: "1", name: "Lead Engineer", email: "admin@test.com" }
        }
        
        // If login fails, return null
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login", // Redirects users to your custom login folder
  },
})
