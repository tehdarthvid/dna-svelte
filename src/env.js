import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  PUBLIC_GITHUB_SHA: {
    public: true,
    static: true,
    description: "Commit the site was built from (CI sets it from GITHUB_SHA)",
    // default so `npm run dev` works without it
    schema: v => v || "dev"
  },
  PUBLIC_GA_TRACKING_ID: {
    public: true,
    static: true,
    description: "GA4 measurement ID; empty disables analytics",
    schema: v => v ?? ""
  }
});
