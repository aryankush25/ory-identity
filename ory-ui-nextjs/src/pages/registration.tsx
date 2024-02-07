import { GetServerSideProps } from "next";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { RegistrationFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

interface RegistrationProps {
  flow: RegistrationFlow;
}

const Registration = ({ flow }: RegistrationProps) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <UserAuthCard
        flow={flow}
        flowType="registration"
        additionalProps={{
          loginURL: "/login",
        }}
        includeScripts
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RegistrationProps> =
  async ({ req, query }) => {
    try {
      const flow = query?.flow as string | undefined;

      if (!isQuerySet(flow)) {
        const initFlowUrl = getUrlForFlow(basePathBrowser, "registration");

        return {
          redirect: {
            destination: initFlowUrl,
            permanent: false,
          },
        };
      }

      const regFlow = await ory.getRegistrationFlow({
        id: flow,
        cookie: req.headers.cookie,
      });

      return {
        props: {
          flow: regFlow.data,
        },
      };
    } catch (error) {
      const errorData = handleGetFlowError("registration")(error);

      return {
        redirect: {
          destination: errorData
            ? errorData.redirectTo
            : "/error?flow=registration&error=" +
              encodeURIComponent(JSON.stringify(error)),
          permanent: false,
        },
      };
    }
  };

export default Registration;
