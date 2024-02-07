import { GetServerSideProps } from "next";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { VerificationFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

interface VerificationProps {
  flow: VerificationFlow;
}

const Verification = ({ flow }: VerificationProps) => {
  return (
    <div className="flex justify-center items-center h-screen dark:bg-gray-900">
      <UserAuthCard
        flow={flow}
        flowType="verification"
        additionalProps={{
          signupURL: "/registration",
        }}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<VerificationProps> =
  async ({ req, query }) => {
    try {
      const flow = query?.flow as string | undefined;

      if (!isQuerySet(flow)) {
        const initFlowUrl = getUrlForFlow(basePathBrowser, "verification");

        return {
          redirect: {
            destination: initFlowUrl,
            permanent: false,
          },
        };
      }

      const verificationFlow = await ory.getVerificationFlow({
        id: flow,
        cookie: req.headers.cookie,
      });

      return {
        props: {
          flow: verificationFlow.data,
        },
      };
    } catch (error) {
      const errorData = handleGetFlowError("verification")(error);

      return {
        redirect: {
          destination: errorData
            ? errorData.redirectTo
            : "/error?flow=verification&json=" + JSON.stringify(errorData),
          permanent: false,
        },
      };
    }
  };

export default Verification;
