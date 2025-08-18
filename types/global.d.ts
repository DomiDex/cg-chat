declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      CONVEX_DEPLOYMENT: string;
      CONVEX_URL: string;
      NEXT_PUBLIC_CONVEX_URL: string;
      DATABASE_URL: string;
      NEON_DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      SESSION_SECRET: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_PHONE_NUMBER: string;
      OPENROUTER_API_KEY: string;
      API_URL: string;
      NEXT_PUBLIC_API_URL: string;
      REDIS_URL?: string;
      SENTRY_DSN?: string;
    }
  }

  interface Window {
    __CONVEX_CLIENT__?: unknown;
    __DEBUG__?: boolean;
  }
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

export {};
