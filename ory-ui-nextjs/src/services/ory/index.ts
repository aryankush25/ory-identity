import {
  AcceptOAuth2ConsentRequestSession,
  Configuration,
  FrontendApi,
  Identity,
  OAuth2Api,
  OAuth2ConsentRequest,
} from "@ory/client";

// TODO: Improve this file naming convention
export const basePathBrowser =
  process.env.NEXT_PUBLIC_KRATOS_BROWSER_URL || "http://127.0.0.1:4433/";
export const basePath =
  process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || "http://kratos:4433/";
export const apiBaseOauth2UrlInternal =
  process.env.HYDRA_ADMIN_URL || "http://hydra:4445/";

export const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: {
      withCredentials: true,
    },
  })
);

console.log("#### apiBaseOauth2UrlInternal", apiBaseOauth2UrlInternal);

export const oauth2 = new OAuth2Api(
  new Configuration({
    basePath: apiBaseOauth2UrlInternal,
    ...(process.env.ORY_ADMIN_API_TOKEN && {
      accessToken: process.env.ORY_ADMIN_API_TOKEN,
    }),
    ...(process.env.MOCK_TLS_TERMINATION && {
      baseOptions: {
        "X-Forwarded-Proto": "https",
      },
    }),
  })
);

// Returns either the email or the username depending on the user's Identity Schema
export const getUserName = (identity: Identity) =>
  identity.traits.email || identity.traits.username;

export const removeTrailingSlash = (s: string) => s.replace(/\/$/, "");

export const getUrlForFlow = (
  base: string,
  flowType: "login" | "registration" | "settings" | "recovery" | "verification",
  query?: URLSearchParams
) =>
  `${removeTrailingSlash(base)}/self-service/${flowType}/browser${
    query ? `?${query.toString()}` : ""
  }`;

export const isQuerySet = (x: any): x is string =>
  typeof x === "string" && x.length > 0;

export const isOAuthConsentRouteEnabled = () =>
  apiBaseOauth2UrlInternal &&
  process.env.CSRF_COOKIE_SECRET &&
  process.env.CSRF_COOKIE_NAME
    ? true
    : false;

export const shouldSkipConsent = (challenge: OAuth2ConsentRequest) => {
  let trustedClients: string[] = [];

  if (process.env.TRUSTED_CLIENT_IDS) {
    trustedClients = String(process.env.TRUSTED_CLIENT_IDS).split(",");
  }

  return challenge.skip ||
    challenge.client?.skip_consent ||
    (challenge.client?.client_id &&
      trustedClients.indexOf(challenge.client?.client_id) > -1)
    ? true
    : false;
};

export const extractSession = (
  identity: Identity | undefined,
  grantScope: string[]
): AcceptOAuth2ConsentRequestSession => {
  const session: AcceptOAuth2ConsentRequestSession = {
    access_token: {},
    id_token: {},
  };

  if (!identity) {
    return session;
  }

  if (grantScope.includes("email")) {
    const addresses = identity.verifiable_addresses || [];
    if (addresses.length > 0) {
      const address = addresses[0];
      if (address.via === "email") {
        session.id_token.email = address.value;
        session.id_token.email_verified = address.verified;
      }
    }
  }

  if (grantScope.includes("profile")) {
    if (identity.traits.username) {
      session.id_token.preferred_username = identity.traits.username;
    }

    if (identity.traits.website) {
      session.id_token.website = identity.traits.website;
    }

    if (typeof identity.traits.name === "object") {
      if (identity.traits.name.first) {
        session.id_token.given_name = identity.traits.name.first;
      }
      if (identity.traits.name.last) {
        session.id_token.family_name = identity.traits.name.last;
      }
    } else if (typeof identity.traits.name === "string") {
      session.id_token.name = identity.traits.name;
    }

    if (identity.updated_at) {
      session.id_token.updated_at = Date.parse(identity.updated_at);
    }
  }

  return session;
};
