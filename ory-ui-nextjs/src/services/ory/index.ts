import { oryConfig } from "@/utils/envConfig";
import {
  AcceptOAuth2ConsentRequestSession,
  Configuration,
  FrontendApi,
  Identity,
  OAuth2Api,
  OAuth2ConsentRequest,
} from "@ory/client";

export const frontend = new FrontendApi(
  new Configuration({
    basePath: oryConfig.apiBaseFrontendUrlInternal,
    baseOptions: {
      withCredentials: true,
    },
  })
);

export const oauth2 = new OAuth2Api(
  new Configuration({
    basePath: oryConfig.apiBaseOauth2UrlInternal,
    ...(oryConfig.mockTlsTermination && {
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
  flowType: "login" | "registration" | "settings" | "recovery" | "verification",
  query?: URLSearchParams
) =>
  `${removeTrailingSlash(
    oryConfig.kratosBrowserUrl
  )}/self-service/${flowType}/browser${query ? `?${query.toString()}` : ""}`;

export const isQuerySet = (x: any): x is string =>
  typeof x === "string" && x.length > 0;

// TODO: Check what is the use of this function
export const isOAuthConsentRouteEnabled = () =>
  oryConfig.apiBaseOauth2UrlInternal &&
  oryConfig.csrfCookieSecret &&
  oryConfig.csrfCookieName
    ? true
    : false;

export const shouldSkipConsent = (challenge: OAuth2ConsentRequest) => {
  let trustedClients: string[] = [];

  if (oryConfig.trustedClientIds) {
    trustedClients = String(oryConfig.trustedClientIds).split(",");
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

export const oidcConformityMaybeFakeSession = (
  grantScope: string[],
  session: AcceptOAuth2ConsentRequestSession
): AcceptOAuth2ConsentRequestSession => {
  if (oryConfig.conformityFakeClaims !== "1") {
    return session;
  }

  const idToken: { [key: string]: any } = {};

  // If the email scope was granted, fake the email claims.
  if (grantScope.indexOf("email") > -1) {
    // But only do so if the email was requested!
    idToken.email = "foo@bar.com";
    idToken.email_verified = true;
  }

  // If the phone scope was granted, fake the phone claims.
  if (grantScope.indexOf("phone") > -1) {
    idToken.phone_number = "1337133713371337";
    idToken.phone_number_verified = true;
  }

  // If the profile scope was granted, fake the profile claims.
  if (grantScope.indexOf("profile") > -1) {
    idToken.name = "Foo Bar";
    idToken.given_name = "Foo";
    idToken.family_name = "Bar";
    idToken.website = "https://www.ory.sh";
    idToken.zoneinfo = "Europe/Belrin";
    idToken.birthdate = "1.1.2014";
    idToken.gender = "robot";
    idToken.profile = "https://www.ory.sh";
    idToken.preferred_username = "robot";
    idToken.middle_name = "Baz";
    idToken.locale = "en-US";
    idToken.picture =
      "https://raw.githubusercontent.com/ory/web/master/static/images/favico.png";
    idToken.updated_at = 1604416603;
    idToken.nickname = "foobot";
  }

  // If the address scope was granted, fake the address claims.
  if (grantScope.indexOf("address") > -1) {
    idToken.address = {
      country: "Localhost",
      region: "Intranet",
      street_address: "Local Street 1337",
    };
  }

  return {
    access_token: session.access_token,
    id_token: {
      ...idToken,
      ...session.id_token,
    },
  };
};
