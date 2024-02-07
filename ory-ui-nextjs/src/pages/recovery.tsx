import { GetServerSideProps } from "next";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { RecoveryFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

interface RecoveryProps {
  flow: RecoveryFlow;
}

const Recovery = ({ flow }: RecoveryProps) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <UserAuthCard
        flowType={"recovery"}
        flow={flow}
        additionalProps={{
          loginURL: "/login",
        }}
        includeScripts={true}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RecoveryProps> = async ({
  req,
  query,
}) => {
  try {
    const flow = query?.flow as string | undefined;

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePathBrowser, "recovery");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const recoveryFlow = await ory.getRecoveryFlow({
      id: flow,
      cookie: req.headers.cookie,
    });

    return {
      props: {
        flow: recoveryFlow.data,
      },
    };
  } catch (error) {
    const errorData = handleGetFlowError("recovery")(error);

    return {
      redirect: {
        destination: errorData
          ? errorData.redirectTo
          : "/error?flow=recovery&json=" + JSON.stringify(errorData),
        permanent: false,
      },
    };
  }
};

export default Recovery;
