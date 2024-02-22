import { GetServerSideProps } from "next";
import { getUrlForFlow, isQuerySet, frontend } from "@/services/ory";
import { RegistrationFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

const flowType = "registration";

interface RegistrationProps {
  flow: RegistrationFlow;
  loginURL: string;
}

const Registration = ({ flow, loginURL }: RegistrationProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <UserAuthCard
        flow={flow}
        flowType={flowType}
        additionalProps={{
          loginURL: loginURL,
        }}
        includeScripts
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RegistrationProps> =
  async ({ req, query }) => {
    const {
      flow,
      return_to,
      after_verification_return_to,
      login_challenge,
      organization,
    } = query;

    const initFlowQuery = new URLSearchParams({
      ...(return_to && { return_to: return_to.toString() }),
      ...(organization && { organization: organization.toString() }),
      ...(after_verification_return_to && {
        after_verification_return_to: after_verification_return_to.toString(),
      }),
    });

    if (isQuerySet(login_challenge)) {
      initFlowQuery.append("login_challenge", login_challenge);
    }

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(flowType, initFlowQuery);

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    try {
      const registrationFlow = (
        await frontend.getRegistrationFlow({
          id: flow,
          cookie: req.headers.cookie,
        })
      ).data;

      const initLoginQuery = new URLSearchParams({
        return_to:
          (return_to && return_to.toString()) ||
          registrationFlow.return_to ||
          "",
      });

      if (registrationFlow.oauth2_login_request?.challenge) {
        initLoginQuery.set(
          "login_challenge",
          registrationFlow.oauth2_login_request.challenge
        );
      }

      const initLoginUrl = getUrlForFlow("login", initLoginQuery);

      return {
        props: {
          flow: registrationFlow,
          loginURL: initLoginUrl,
        },
      };
    } catch (error) {
      const errorData = handleGetFlowError(flowType)(error);

      return {
        redirect: {
          destination: errorData
            ? errorData.redirectTo
            : `/error?flow=${flowType}&error=` +
              encodeURIComponent(JSON.stringify(error)),
          permanent: false,
        },
      };
    }
  };

export default Registration;
