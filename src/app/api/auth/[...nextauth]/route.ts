import { handlers } from "@/src/auth" // Imports handlers from your src/auth.ts file

// Expose the internal login/logout mechanics to the internet
export const { GET, POST } = handlers
