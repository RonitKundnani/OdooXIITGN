export const APP_NAME = "WorkZen"
export const APP_DESCRIPTION = "Building better productivity solutions for modern teams"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  FEATURES: "/features",
  PRICING: "/pricing",
  CONTACT: "/contact",
  DOCS: "/docs",
} as const
