import { SettingsFlow } from "@ory/client";
import type { GetServerSideProps, NextPage } from "next";
import { getUrlForFlow, isQuerySet, frontend } from "@/services/ory";
import { handleError, handleGetFlowError } from "@/services/ory/error";
import {
  NodeMessages,
  UserSettingsCard,
  UserSettingsFlowType,
  gridStyle,
} from "@ory/elements";
import { customClsx } from "@/utils/helpers";

interface SettingsProps {
  flow: SettingsFlow;
}

const Settings: NextPage<SettingsProps> = ({ flow }) => {
  console.log("#### flow", flow);

  return (
    <div
      className={customClsx(
        "max-w-xl m-auto my-6 px-4",
        gridStyle({ gap: 16 })
      )}
    >
      <h1 className="text-4xl font-bold mb-4">User settings</h1>

      <NodeMessages uiMessages={flow.ui.messages} />

      {(
        [
          "profile",
          "password",
          "totp",
          "webauthn",
          "lookup_secret",
          "oidc",
        ] as UserSettingsFlowType[]
      ).map((flowType: UserSettingsFlowType, index) => (
        <UserSettingsCard
          key={index}
          flow={flow}
          method={flowType}
          includeScripts
        />
      ))}
    </div>
  );
};

export default Settings;

export const getServerSideProps: GetServerSideProps<SettingsProps> = async ({
  query,
  req,
}) => {
  try {
    const flow = query?.flow as string | undefined;

    console.log("#### req.headers.cookie", req.headers.cookie);

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow("settings");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const settingsFlow = await frontend.getSettingsFlow({
      id: flow,
      cookie: req.headers.cookie,
    });

    return {
      props: {
        flow: settingsFlow.data,
      },
    };
  } catch (error) {
    const errorData = handleGetFlowError("settings")(error);
    const redirectTo = !errorData ? handleError(error).redirectTo : null;

    return {
      redirect: {
        destination: errorData
          ? errorData.redirectTo
          : redirectTo
          ? redirectTo
          : "/error?flow=settings&error=" +
            encodeURIComponent(JSON.stringify(error)),
        permanent: false,
      },
    };
  }
};
