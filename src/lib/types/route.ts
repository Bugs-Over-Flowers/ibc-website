//=================
//
// Type definitions for route parameters
//
//=================

export type RegistrationRouteProps = PageProps<"/registration/[eventId]">;

export type RegistrationInformationPageProps =
  PageProps<"/registration/[eventId]/info">;

export type RegistrationListPageProps =
  PageProps<"/admin/events/[eventId]/registration-list">;
