import { GetServerSideProps } from "next";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { UiText, VerificationFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

const flowType = "verification";

interface VerificationProps {
  flow: VerificationFlow;
  signupURL: string;
}

const Verification = ({ flow, signupURL }: VerificationProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <UserAuthCard
        flow={flow}
        flowType={flowType}
        additionalProps={{
          signupURL: signupURL,
        }}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<
  VerificationProps
> = async ({ req, query }) => {
  const { flow, return_to = "", message } = query;

  if (!isQuerySet(flow)) {
    const initFlowUrl = getUrlForFlow(
      basePathBrowser,
      flowType,
      new URLSearchParams({
        return_to: return_to.toString(),
        ...(message ? { message: message.toString() } : {}),
      }),
    );

    return {
      redirect: {
        destination: initFlowUrl,
        permanent: false,
      },
    };
  }

  try {
    const verificationFlow = (
      await ory.getVerificationFlow({
        id: flow,
        cookie: req.headers.cookie,
      })
    ).data;

    const initRegistrationUrl = getUrlForFlow(
      basePathBrowser,
      "registration",
      new URLSearchParams({
        return_to:
          (return_to && return_to.toString()) ||
          verificationFlow.return_to ||
          "",
      }),
    );

    const message = new URL(
      verificationFlow.request_url || "",
    ).searchParams.get("message");

    // check for custom messages in the request_url
    if (isQuerySet(message)) {
      const m: UiText[] = JSON.parse(message || "");

      // add them to the flow data so they can be rendered by the UI
      verificationFlow.ui.messages = [
        ...(verificationFlow.ui.messages || []),
        ...m,
      ];
    }

    return {
      props: {
        flow: verificationFlow,
        signupURL: initRegistrationUrl,
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

export default Verification;
