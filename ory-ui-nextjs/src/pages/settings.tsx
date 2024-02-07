import { SettingsFlow, UiNode, UiNodeInputAttributes } from "@ory/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { handleGetFlowError } from "@/services/ory/error";
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui";
import { Fragment, useCallback, useMemo } from "react";

interface SettingsProps {
  flow: SettingsFlow;
}

const Settings: NextPage<SettingsProps> = ({ flow }) => {
  console.log("#### flow", flow);

  const mapUINode = useCallback((node: UiNode, key: number) => {
    if (isUiNodeInputAttributes(node.attributes)) {
      const attrs = node.attributes as UiNodeInputAttributes;
      const nodeType = attrs.type;

      switch (nodeType) {
        case "button":
        case "submit":
          return (
            <button
              className="w-full px-3 py-2 mb-2 text-sm font-bold text-white bg-blue-500 rounded shadow hover:bg-blue-700 focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:shadow-outline"
              title="Submit"
              type={attrs.type as "submit" | "reset" | "button" | undefined}
              name={attrs.name}
              value={attrs.value}
            >
              {node.meta.label?.text}
            </button>
          );
        default:
          return (
            <Fragment>
              <input
                className="w-full px-3 py-2 mb-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:shadow-outline"
                title="Input field"
                placeholder={"Enter " + node.meta.label?.text}
                name={attrs.name}
                type={attrs.type}
                autoComplete={
                  attrs.autocomplete || attrs.name === "identifier"
                    ? "username"
                    : ""
                }
                defaultValue={attrs.value}
                required={attrs.required}
                disabled={attrs.disabled}
              />

              {node.messages[0]?.text ? (
                <p className="text-xs italic text-red-500 dark:text-red-400">
                  {node.messages[0].text}
                </p>
              ) : null}
            </Fragment>
          );
      }
    }
  }, []);

  const nodes = useMemo(
    () =>
      filterNodesByGroups({
        nodes: flow.ui.nodes,
        groups: ["default", "password"],
      }),
    [flow.ui.nodes]
  );

  console.log("#### nodes", nodes);

  return (
    <div className="flex justify-center items-center flex-col h-screen dark:bg-gray-900">
      <Head>
        <title>Profile Management and Security Settings</title>
        <meta
          name="description"
          content="Profile Management and Security Settings"
        />
      </Head>
      <h1 className="mb-8 dark:text-white text-xl">
        Profile Management and Security Settings
      </h1>

      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-md"
        action={flow.ui.action}
        method={flow.ui.method}
      >
        <h2 className="mb-8 dark:text-white text-xl">Change Password</h2>

        <p className="mb-4 text-sm dark:text-white">
          {flow.ui.messages?.[0]?.text}
        </p>

        {nodes.map((node, idx) => (
          <div key={idx} className="mb-4">
            {mapUINode(node, idx)}
          </div>
        ))}
      </form>
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

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePathBrowser, "settings");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const settingsFlow = await ory.getSettingsFlow({
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

    return {
      redirect: {
        destination: errorData
          ? errorData.redirectTo
          : "/error?flow=settings&json=" + JSON.stringify(errorData),
        permanent: false,
      },
    };
  }
};
