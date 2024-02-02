import { GetServerSideProps } from "next";
import { useCallback, useMemo } from "react";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { LoginFlow, UiNode, UiNodeInputAttributes } from "@ory/client";
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui";

interface LoginProps {
  flow: LoginFlow;
}

const Login = ({ flow }: LoginProps) => {
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

  return (
    <div className="flex justify-center items-center h-screen dark:bg-gray-900">
      <div className="w-full max-w-md">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800"
          action={flow.ui.action}
          method={flow.ui.method}
        >
          <h1 className="mb-4 text-sm dark:text-white">
            {flow.ui.messages?.[0]?.text}
          </h1>
          {nodes.map((node, idx) => (
            <div key={idx} className="mb-4">
              {mapUINode(node, idx)}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async ({
  req,
  query,
}) => {
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

  try {
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
    console.log("#### error login", error);

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};

export default Login;