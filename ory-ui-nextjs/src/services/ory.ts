import { Configuration, FrontendApi, Identity } from "@ory/client";

export const basePath = process.env.NEXT_PUBLIC_KRATOS_BROWSER_URL;

console.log("basePath", basePath);

export const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: {
      withCredentials: true,
    },
  })
);

// Returns either the email or the username depending on the user's Identity Schema
export const getUserName = (identity: Identity) =>
  identity.traits.email || identity.traits.username;

export const removeTrailingSlash = (s: string) => s.replace(/\/$/, "");

export const getUrlForFlow = (
  base: string,
  flow: string,
  query?: URLSearchParams
) =>
  `${removeTrailingSlash(base)}/self-service/${flow}/browser${
    query ? `?${query.toString()}` : ""
  }`;

export const isQuerySet = (x: any): x is string =>
  typeof x === "string" && x.length > 0;
