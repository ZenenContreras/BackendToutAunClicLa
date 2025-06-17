import { config } from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`;
config({ path: envFile });

if (!process.env.PORT) {
    process.env.PORT = 3001;
}

export const { 
    NODE_ENV,
    PORT,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET,
    STRIPE_SECRET_KEY,
    FRONTEND_URL,
    ARCJET_KEY,
    RESEND_API_KEY
} = process.env;