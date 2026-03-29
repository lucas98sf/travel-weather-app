/**
 * @generated SignedSource<<18ed193e15598ec76e56f13656dec109>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type homePageSearchDestinationsQuery$variables = {
  locale: string;
  query: string;
};
export type homePageSearchDestinationsQuery$data = {
  readonly searchDestinations: ReadonlyArray<{
    readonly country: string;
    readonly id: string;
    readonly name: string;
    readonly region: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"destinationCombobox_destination">;
  }>;
};
export type homePageSearchDestinationsQuery = {
  response: homePageSearchDestinationsQuery$data;
  variables: homePageSearchDestinationsQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "locale",
      },
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "query",
      },
    ],
    v1 = [
      {
        kind: "Variable",
        name: "locale",
        variableName: "locale",
      },
      {
        kind: "Variable",
        name: "query",
        variableName: "query",
      },
    ],
    v2 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "id",
      storageKey: null,
    },
    v3 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "name",
      storageKey: null,
    },
    v4 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "region",
      storageKey: null,
    },
    v5 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "country",
      storageKey: null,
    },
    v6 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "latitude",
      storageKey: null,
    },
    v7 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "longitude",
      storageKey: null,
    },
    v8 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "timezone",
      storageKey: null,
    };
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "homePageSearchDestinationsQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "LocationOption",
          kind: "LinkedField",
          name: "searchDestinations",
          plural: true,
          selections: [
            v2 /*: any*/,
            v3 /*: any*/,
            v4 /*: any*/,
            v5 /*: any*/,
            {
              kind: "InlineDataFragmentSpread",
              name: "destinationCombobox_destination",
              selections: [
                v5 /*: any*/,
                v2 /*: any*/,
                v6 /*: any*/,
                v7 /*: any*/,
                v3 /*: any*/,
                v4 /*: any*/,
                v8 /*: any*/,
              ],
              args: null,
              argumentDefinitions: [],
            },
          ],
          storageKey: null,
        },
      ],
      type: "Query",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "homePageSearchDestinationsQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "LocationOption",
          kind: "LinkedField",
          name: "searchDestinations",
          plural: true,
          selections: [
            v2 /*: any*/,
            v3 /*: any*/,
            v4 /*: any*/,
            v5 /*: any*/,
            v6 /*: any*/,
            v7 /*: any*/,
            v8 /*: any*/,
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "2f65e14f9b451bfda4024ba3fd2c7634",
      id: null,
      metadata: {},
      name: "homePageSearchDestinationsQuery",
      operationKind: "query",
      text: "query homePageSearchDestinationsQuery(\n  $locale: String!\n  $query: String!\n) {\n  searchDestinations(locale: $locale, query: $query) {\n    id\n    name\n    region\n    country\n    ...destinationCombobox_destination\n  }\n}\n\nfragment destinationCombobox_destination on LocationOption {\n  country\n  id\n  latitude\n  longitude\n  name\n  region\n  timezone\n}\n",
    },
  };
})();

(node as any).hash = "1fe6f93964888edae31aff23a8f0f4c4";

export default node;
