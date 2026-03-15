/**
 * Environment variable validation
 * Validates required env vars at build/runtime
 */
const requiredEnvVars = [
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_VIDEO_GEN_API_URL',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GITHUB_CLIENT_ID',
  'NEXT_PUBLIC_MICROSOFT_CLIENT_ID',
  'NEXT_PUBLIC_APPLE_CLIENT_ID',
  'NEXT_PUBLIC_CHATBOT_URL',
  'NEXT_PUBLIC_MYNOTEBOOKLM_URL',
];

export function validateEnv() {
  // Skip validation during build or on server
  if (typeof window === 'undefined') return;
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn about missing optional vars in development
  if (process.env.NODE_ENV === 'development') {
    const missingOptional = optionalEnvVars.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
      console.warn(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    }
  }
}

export default validateEnv;
