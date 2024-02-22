export const oryConfig = {
  kratosBrowserUrl:
    process.env.NEXT_PUBLIC_KRATOS_BROWSER_URL || "http://127.0.0.1:4433/",
  apiBaseFrontendUrlInternal:
    process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || "http://kratos:4433/",
  apiBaseOauth2UrlInternal: process.env.HYDRA_ADMIN_URL || "http://hydra:4445/",
};
