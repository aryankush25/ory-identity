import { GetServerSideProps } from "next";
import { getUrlForFlow, isQuerySet, frontend } from "@/services/ory";
import { RecoveryFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

const flowType = "recovery";

interface RecoveryProps {
  flow: RecoveryFlow;
  loginURL: string;
}

const Recovery = ({ flow, loginURL }: RecoveryProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <UserAuthCard
        flowType={flowType}
        flow={flow}
        additionalProps={{
          loginURL: loginURL,
        }}
        includeScripts
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RecoveryProps> = async ({
  req,
  query,
}) => {
  try {
    const { flow, return_to = "" } = query;

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(
        flowType,
        new URLSearchParams({ return_to: return_to.toString() })
      );

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const recoveryFlow = (
      await frontend.getRecoveryFlow({
        id: flow,
        cookie: req.headers.cookie,
      })
    ).data;

    const initLoginUrl = getUrlForFlow(
      "login",
      new URLSearchParams({
        return_to:
          (return_to && return_to.toString()) || recoveryFlow.return_to || "",
      })
    );

    return {
      props: {
        flow: recoveryFlow,
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

export default Recovery;
