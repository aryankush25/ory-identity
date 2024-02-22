export const oryConfig = {
  kratosBrowserUrl:
    process.env.NEXT_PUBLIC_KRATOS_BROWSER_URL || "http://127.0.0.1:4433/",
  apiBaseFrontendUrlInternal:
    process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || "http://kratos:4433/",
  apiBaseOauth2UrlInternal: process.env.HYDRA_ADMIN_URL || "http://hydra:4445/",

  mockTlsTermination: process.env.MOCK_TLS_TERMINATION,
  trustedClientIds: process.env.TRUSTED_CLIENT_IDS,
  conformityFakeClaims: process.env.CONFORMITY_FAKE_CLAIMS,

  csrfCookieSecret: process.env.CSRF_COOKIE_SECRET,
  csrfCookieName: process.env.CSRF_COOKIE_NAME,

  rememberConsentSessionForSeconds: process.env
    .REMEMBER_CONSENT_SESSION_FOR_SECONDS
    ? Number(process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS)
    : 3600,
};
