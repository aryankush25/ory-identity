import {
  extractSession,
  //   isOAuthConsentRouteEnabled,
  oauth2,
  oidcConformityMaybeFakeSession,
  ory,
} from "@/services/ory";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // if (!isOAuthConsentRouteEnabled()) {
  //   res.redirect("404");
  //   return;
  // }

  const {
    consent_challenge: challenge,
    consent_action,
    remember,
    grant_scope,
  } = req.body;

  let grantScope = grant_scope;
  if (!Array.isArray(grantScope)) {
    grantScope = [grantScope];
  }

  const sessionResponse = (
    await ory.toSession({
      cookie: req.headers.cookie,
    })
  ).data;

  const session = extractSession(sessionResponse.identity, grantScope);

  // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
  // Let's see if the user decided to accept or reject the consent request..
  if (consent_action === "accept") {
    const consent = (
      await oauth2.getOAuth2ConsentRequest({
        consentChallenge: String(challenge),
      })
    ).data;

    const acceptedConsent = (
      await oauth2.acceptOAuth2ConsentRequest({
        consentChallenge: String(challenge),
        acceptOAuth2ConsentRequest: {
          // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
          // are requested accidentally.
          grant_scope: grantScope,

          // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
          // the app is built for the automated OpenID Connect Conformity Test Suite. You
          // can peak inside the code for some ideas, but be aware that all data is fake
          // and this only exists to fake a login system which works in accordance to OpenID Connect.
          //
          // If that variable is not set, the session will be used as-is.
          session: oidcConformityMaybeFakeSession(grantScope, session),

          // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
          grant_access_token_audience: consent.requested_access_token_audience,

          // This tells hydra to remember this consent request and allow the same client to request the same
          // scopes from the same user, without showing the UI, in the future.
          remember: Boolean(remember),

          // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
          remember_for: process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS
            ? Number(process.env.REMEMBER_CONSENT_SESSION_FOR_SECONDS)
            : 3600,
        },
      })
    ).data;

    return res.redirect(String(acceptedConsent.redirect_to));
  }

  const rejectedConsent = (
    await oauth2.rejectOAuth2ConsentRequest({
      consentChallenge: String(challenge),
      rejectOAuth2Request: {
        error: "access_denied",
        error_description: "The resource owner denied the request",
      },
    })
  ).data;

  // All we need to do now is to redirect the browser back to hydra!
  return res.redirect(String(rejectedConsent.redirect_to));
}
