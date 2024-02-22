import { GetServerSideProps } from "next";
import { getUrlForFlow, isQuerySet, frontend } from "@/services/ory";
import { LoginFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

const flowType = "login";

interface LoginProps {
  flow: LoginFlow;
  forgotPasswordURL: string;
  signupURL: string;
  logoutURL: string;
}

const Login = ({
  flow,
  forgotPasswordURL,
  signupURL,
  logoutURL,
}: LoginProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <UserAuthCard
        flowType={flowType}
        flow={flow}
        additionalProps={{
          forgotPasswordURL: forgotPasswordURL,
          signupURL: signupURL,
          logoutURL: logoutURL,
        }}
        includeScripts
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async ({
  req,
  query,
}) => {
  const {
    flow,
    aal = "",
    refresh = "",
    return_to = "",
    organization = "",
    via = "",
    login_challenge,
  } = query;

  const initFlowQuery = new URLSearchParams({
    aal: aal.toString(),
    refresh: refresh.toString(),
    return_to: return_to.toString(),
    organization: organization.toString(),
    via: via.toString(),
  });

  if (isQuerySet(login_challenge)) {
    initFlowQuery.append("login_challenge", login_challenge);
  }

  // The flow is used to identify the settings and registration flow and
  // return data like the csrf_token and so on.
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
    const loginFlow = (
      await frontend.getLoginFlow({
        id: flow,
        cookie: req.headers.cookie,
      })
    ).data;

    if (loginFlow.ui.messages && loginFlow.ui.messages.length > 0) {
      // the login requires that the user verifies their email address before logging in
      if (loginFlow.ui.messages.some(({ id }) => id === 4000010)) {
        // we will create a new verification flow and redirect the user to the verification page
        const initVerificationUrl = getUrlForFlow(
          "verification",
          new URLSearchParams({
            return_to:
              (return_to && return_to.toString()) || loginFlow.return_to || "",
            message: JSON.stringify(loginFlow.ui.messages),
          })
        );

        return {
          redirect: {
            destination: initVerificationUrl,
            permanent: false,
          },
        };
      }
    }

    const initRegistrationQuery = new URLSearchParams({
      return_to:
        (return_to && return_to.toString()) || loginFlow.return_to || "",
    });
    if (loginFlow.oauth2_login_request?.challenge) {
      initRegistrationQuery.set(
        "login_challenge",
        loginFlow.oauth2_login_request.challenge
      );
    }
    const initRegistrationUrl = getUrlForFlow(
      "registration",
      initRegistrationQuery
    );

    let initRecoveryUrl = "";
    if (!loginFlow.refresh) {
      initRecoveryUrl = getUrlForFlow(
        "recovery",
        new URLSearchParams({
          return_to:
            (return_to && return_to.toString()) || loginFlow.return_to || "",
        })
      );
    }

    // It is probably a bit strange to have a logout URL here, however this screen
    // is also used for 2FA flows. If something goes wrong there, we probably want
    // to give the user the option to sign out!
    let logoutUrl: string | undefined = "";
    if (loginFlow.requested_aal === "aal2" || loginFlow.refresh) {
      logoutUrl =
        "/logout" +
        (return_to
          ? new URLSearchParams({
              return_to: return_to.toString() || loginFlow.return_to || "",
            })
          : "");
    }

    return {
      props: {
        flow: loginFlow,
        forgotPasswordURL: initRecoveryUrl,
        signupURL: initRegistrationUrl,
        logoutURL: logoutUrl,
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

export default Login;
