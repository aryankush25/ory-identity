import { GetServerSideProps } from "next";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { LoginFlow } from "@ory/client";
import { handleGetFlowError } from "@/services/ory/error";
import { UserAuthCard } from "@ory/elements";

interface LoginProps {
  flow: LoginFlow;
}

const Login = ({ flow }: LoginProps) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <UserAuthCard
        flowType="login"
        flow={flow}
        additionalProps={{
          forgotPasswordURL: "/recovery",
          signupURL: "/registration",
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
  try {
    const flow = query?.flow as string | undefined;

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePathBrowser, "login");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const loginFlow = await ory.getLoginFlow({
      id: flow,
      cookie: req.headers.cookie,
    });

    return {
      props: {
        flow: loginFlow.data,
      },
    };
  } catch (error) {
    const errorData = handleGetFlowError("login")(error);

    return {
      redirect: {
        destination: errorData
          ? errorData.redirectTo
          : "/error?flow=login&json=" + JSON.stringify(errorData),
        permanent: false,
      },
    };
  }
};

export default Login;
