import {
  Environment,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
  type RequestParameters,
  type Variables,
} from "relay-runtime";

function getDefaultGraphqlUrl() {
  if (import.meta.env.VITE_GRAPHQL_URL) {
    return import.meta.env.VITE_GRAPHQL_URL;
  }

  return import.meta.env.DEV ? "http://localhost:4000/graphql" : "/api/graphql";
}

const fetchGraphQL: FetchFunction = async (params: RequestParameters, variables: Variables) => {
  const response = await fetch(getDefaultGraphqlUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with ${response.status}`);
  }

  return response.json() as Promise<GraphQLResponse>;
};

export const relayEnvironment = new Environment({
  network: Network.create(fetchGraphQL),
  store: new Store(new RecordSource()),
});
