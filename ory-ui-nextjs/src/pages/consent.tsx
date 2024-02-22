import {
  extractSession,
  // isOAuthConsentRouteEnabled,
  oauth2,
  ory,
  shouldSkipConsent,
} from "@/services/ory";
import { handleError } from "@/services/ory/error";
import { GetServerSideProps } from "next";
import { UserConsentCard, UserConsentCardProps } from "@ory/elements";

export default function Consent({
  consent,
  csrfToken,
  cardImage,
  client_name,
  requested_scope,
  client,
  action,
}: UserConsentCardProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <UserConsentCard
        csrfToken={csrfToken}
        cardImage={cardImage}
        client_name={client_name}
        requested_scope={requested_scope}
        client={client}
        action={action}
        consent={consent}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { consent_challenge } = query;

  try {
    // if (!isOAuthConsentRouteEnabled()) {
    //   return {
    //     redirect: {
    //       destination: "/404",
    //       permanent: false,
    //     },
    //   };
    // }

    // The challenge is used to fetch information about the consent request from ORY hydraAdmin.
    const challenge = String(consent_challenge);

    if (!challenge) {
      throw new Error(
        "Expected a consent challenge to be set but received none."
      );
    }

    // This section processes consent requests and either shows the consent UI or
    // accepts the consent request right away if the user has given consent to this
    // app before
    const consent = (
      await oauth2.getOAuth2ConsentRequest({ consentChallenge: challenge })
    ).data;

    // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
    if (shouldSkipConsent(consent)) {
      let grantScope = consent.requested_scope || [];

      const sessionResponse = (
        await ory.toSession({
          cookie: req.headers.cookie,
        })
      ).data;

      console.log("#### sessionResponse", sessionResponse);

      // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
      const acceptedSession = (
        await oauth2.acceptOAuth2ConsentRequest({
          consentChallenge: challenge,
          acceptOAuth2ConsentRequest: {
            // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
            // are requested accidentally.
            grant_scope: grantScope,

            // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
            grant_access_token_audience:
              consent.requested_access_token_audience,

            // The session allows us to set session data for id and access tokens
            session: extractSession(sessionResponse.identity, grantScope),
          },
        })
      ).data;

      return {
        redirect: {
          destination: String(acceptedSession.redirect_to),
          permanent: false,
        },
      };
    }

    // if (!req.csrfToken) {
    //   throw new Error(
    //     "Expected CSRF token middleware to be set but received none."
    //   );
    // }

    console.log("#### consent", consent);

    return {
      props: {
        consent: consent,
        // csrfToken: req.csrfToken(true),
        // TODO: Generate CSRF token
        csrfToken: "req.csrfToken(true)",
        cardImage: consent.client?.logo_uri,
        client_name:
          consent.client?.client_name ||
          consent.client?.client_id ||
          "Unknown Client",
        requested_scope: consent.requested_scope || [],
        client: consent.client,
        action: "api/consent",
      },
    };
  } catch (error) {
    console.log("#### error", error);

    return {
      redirect: {
        destination: handleError(error).redirectTo,
        permanent: false,
      },
    };
  }
};
