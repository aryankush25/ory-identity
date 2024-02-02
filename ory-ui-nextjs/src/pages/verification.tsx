import { GetServerSideProps } from "next";
import { useCallback, useMemo } from "react";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import {
  VerificationFlow,
  UiNode,
  UiNodeInputAttributes,
  UiNodeAnchorAttributes,
} from "@ory/client";
import {
  filterNodesByGroups,
  isUiNodeAnchorAttributes,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui";

interface VerificationProps {
  flow: VerificationFlow;
}

const Verification = ({ flow }: VerificationProps) => {
  console.log("#### flow", flow);

  const mapUINode = useCallback((node: UiNode, key: number) => {
    console.log("#### node", node);

    if (isUiNodeInputAttributes(node.attributes)) {
      const attrs = node.attributes as UiNodeInputAttributes;
      const nodeType = attrs.type;

      console.log("#### nodeType", nodeType);

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
              key={key}
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
              key={key}
            />
          );
      }
    }

    if (isUiNodeAnchorAttributes(node.attributes)) {
      const attrs = node.attributes as UiNodeAnchorAttributes;
      console.log("#### attrs", attrs);

      return (
        <a
          className="w-full px-3 py-2 mb-2 text-sm font-bold text-white bg-blue-500 rounded shadow hover:bg-blue-700 focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:shadow-outline"
          title="Anchor"
          href={attrs.href}
          key={key}
        >
          {node.meta.label?.text}
        </a>
      );
    }
  }, []);

  const nodes = useMemo(
    () =>
      filterNodesByGroups({
        nodes: flow.ui.nodes,
        groups: ["default", "code", "link"],
      }),
    [flow.ui.nodes]
  );

  console.log("#### nodes", nodes);

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

export const getServerSideProps: GetServerSideProps<VerificationProps> =
  async ({ req, query }) => {
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

    try {
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
      console.log("#### error", error);

      return {
        redirect: {
          destination: "/registration",
          permanent: false,
        },
      };
    }
  };

export default Verification;
