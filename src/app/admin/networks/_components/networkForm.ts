import type { Network } from "@/server/networks/types";

export type NetworkFormState = {
  organization: string;
  about: string;
  locationType: string;
  representativeName: string;
  representativePosition: string;
  logoUrl: string | null;
};

export type SortOption = "newest" | "oldest";

export const EMPTY_FORM: NetworkFormState = {
  organization: "",
  about: "",
  locationType: "",
  representativeName: "",
  representativePosition: "",
  logoUrl: null,
};

export function mapNetworkToFormState(network: Network): NetworkFormState {
  return {
    organization: network.organization,
    about: network.about,
    locationType: network.locationType,
    representativeName: network.representativeName,
    representativePosition: network.representativePosition,
    logoUrl: network.logoUrl,
  };
}

export function normalizeFormState(
  formState: NetworkFormState,
): NetworkFormState {
  return {
    organization: formState.organization.trim(),
    about: formState.about.trim(),
    locationType: formState.locationType.trim(),
    representativeName: formState.representativeName.trim(),
    representativePosition: formState.representativePosition.trim(),
    logoUrl: formState.logoUrl?.trim() ? formState.logoUrl.trim() : null,
  };
}

export function isFormValid(formState: NetworkFormState): boolean {
  return (
    formState.organization.length > 0 &&
    formState.about.length > 0 &&
    formState.locationType.length > 0 &&
    formState.representativeName.length > 0 &&
    formState.representativePosition.length > 0
  );
}
