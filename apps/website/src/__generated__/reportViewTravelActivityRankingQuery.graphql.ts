/**
 * @generated SignedSource<<f91192ed1c9c07f73054a0802e6d0e71>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type reportViewTravelActivityRankingQuery$variables = {
  locale: string;
  locationId: string;
};
export type reportViewTravelActivityRankingQuery$data = {
  readonly travelActivityRanking: {
    readonly " $fragmentSpreads": FragmentRefs<"reportView_report">;
  };
};
export type reportViewTravelActivityRankingQuery = {
  response: reportViewTravelActivityRankingQuery$data;
  variables: reportViewTravelActivityRankingQuery$variables;
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
        name: "locationId",
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
        name: "locationId",
        variableName: "locationId",
      },
    ],
    v2 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "activity",
      storageKey: null,
    },
    v3 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "score",
      storageKey: null,
    },
    v4 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "label",
      storageKey: null,
    },
    v5 = {
      alias: null,
      args: null,
      concreteType: "ActivityFactor",
      kind: "LinkedField",
      name: "factors",
      plural: true,
      selections: [
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "key",
          storageKey: null,
        },
        v4 /*: any*/,
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "impact",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "value",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "unit",
          storageKey: null,
        },
      ],
      storageKey: null,
    };
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "reportViewTravelActivityRankingQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "TravelActivityReport",
          kind: "LinkedField",
          name: "travelActivityRanking",
          plural: false,
          selections: [
            {
              args: null,
              kind: "FragmentSpread",
              name: "reportView_report",
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
      name: "reportViewTravelActivityRankingQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
          concreteType: "TravelActivityReport",
          kind: "LinkedField",
          name: "travelActivityRanking",
          plural: false,
          selections: [
            {
              alias: null,
              args: null,
              kind: "ScalarField",
              name: "generatedAt",
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              concreteType: "LocationOption",
              kind: "LinkedField",
              name: "location",
              plural: false,
              selections: [
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "name",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "region",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "country",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "timezone",
                  storageKey: null,
                },
              ],
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              concreteType: "ActivityRecommendation",
              kind: "LinkedField",
              name: "activities",
              plural: true,
              selections: [
                v2 /*: any*/,
                v3 /*: any*/,
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "rank",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "bestDay",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "summary",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "note",
                  storageKey: null,
                },
                v5 /*: any*/,
              ],
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              concreteType: "DailyActivitySummary",
              kind: "LinkedField",
              name: "dailySummaries",
              plural: true,
              selections: [
                v2 /*: any*/,
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "date",
                  storageKey: null,
                },
                v5 /*: any*/,
                v4 /*: any*/,
                v3 /*: any*/,
              ],
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "fa17fac5bb67cddc3ab5be4e6184feb9",
      id: null,
      metadata: {},
      name: "reportViewTravelActivityRankingQuery",
      operationKind: "query",
      text: "query reportViewTravelActivityRankingQuery(\n  $locale: String!\n  $locationId: String!\n) {\n  travelActivityRanking(locale: $locale, locationId: $locationId) {\n    ...reportView_report\n  }\n}\n\nfragment activityCard_recommendation on ActivityRecommendation {\n  activity\n  score\n  rank\n  bestDay\n  summary\n  note\n  factors {\n    key\n    label\n    impact\n    value\n    unit\n  }\n}\n\nfragment reportView_report on TravelActivityReport {\n  generatedAt\n  location {\n    name\n    region\n    country\n    timezone\n  }\n  activities {\n    activity\n    ...activityCard_recommendation\n  }\n  dailySummaries {\n    activity\n    date\n    factors {\n      key\n      label\n      impact\n      value\n      unit\n    }\n    label\n    score\n  }\n}\n",
    },
  };
})();

(node as any).hash = "1ed8f0edfb2fe2b6fd0c22c08c70d1d6";

export default node;
