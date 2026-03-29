/**
 * @generated SignedSource<<27da0868d116b988725c9dc2aa263e54>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type destinationCombobox_destination$data = {
  readonly country: string;
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly region: string | null | undefined;
  readonly timezone: string;
  readonly " $fragmentType": "destinationCombobox_destination";
};
export type destinationCombobox_destination$key = {
  readonly " $data"?: destinationCombobox_destination$data;
  readonly " $fragmentSpreads": FragmentRefs<"destinationCombobox_destination">;
};

const node: ReaderInlineDataFragment = {
  kind: "InlineDataFragment",
  name: "destinationCombobox_destination",
};

(node as any).hash = "9b9c68c4b9dc84e56c6c504f4e76d621";

export default node;
