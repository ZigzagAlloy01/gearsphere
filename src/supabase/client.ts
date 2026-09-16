import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.GEARSPHERE_DATABASE_URL!,
        process.env.GEARSHPERE_ANON_KEY!
    )
}