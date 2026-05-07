import { beforeEach, describe, expect, it } from "vitest";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";

/**
 * ============================================================================
 * UNIT TESTS: useMembershipApplicationStore (Zustand Store)
 * ============================================================================
 *
 * Tests the persisted Zustand store that manages multi-step membership
 * application form state, member validation, and submission tracking.
 */

describe("useMembershipApplicationStore", () => {
  beforeEach(() => {
    useMembershipApplicationStore.getState().resetStore();
  });

  // ✅ HAPPY FLOW: Initial state defaults
  it("should start at step 1 with newMember application type", () => {
    const state = useMembershipApplicationStore.getState();

    expect(state.step).toBe(1);
    expect(state.applicationData.step1.applicationType).toBe("newMember");
    expect(state.isSubmitted).toBe(false);
  });

  // ✅ HAPPY FLOW: setStep updates step
  it("should update step when setStep is called", () => {
    useMembershipApplicationStore.getState().setStep(3);

    const { step } = useMembershipApplicationStore.getState();
    expect(step).toBe(3);
  });

  // ✅ HAPPY FLOW: setStep accepts boundary values
  it.each([1, 5])("should accept step %i", (stepValue) => {
    useMembershipApplicationStore.getState().setStep(stepValue);

    const { step } = useMembershipApplicationStore.getState();
    expect(step).toBe(stepValue);
  });

  // ✅ HAPPY FLOW: setApplicationData merges partial updates
  it("should merge partial application data", () => {
    useMembershipApplicationStore.getState().setApplicationData({
      step1: {
        applicationType: "renewal",
        businessMemberIdentifier: "ibc-mem-test",
      },
    });

    const { applicationData } = useMembershipApplicationStore.getState();
    expect(applicationData.step1.applicationType).toBe("renewal");
    expect(applicationData.step1.businessMemberIdentifier).toBe("ibc-mem-test");
    // Other steps remain unchanged
    expect(applicationData.step2.companyName).toBe("");
  });

  // ✅ HAPPY FLOW: setIsSubmitted
  it("should set isSubmitted to true", () => {
    useMembershipApplicationStore.getState().setIsSubmitted(true);

    const { isSubmitted } = useMembershipApplicationStore.getState();
    expect(isSubmitted).toBe(true);
  });

  // ✅ HAPPY FLOW: resetStore returns to initial state
  it("should reset to initial values", () => {
    useMembershipApplicationStore.getState().setStep(4);
    useMembershipApplicationStore.getState().setIsSubmitted(true);
    useMembershipApplicationStore.getState().resetStore();

    const state = useMembershipApplicationStore.getState();
    expect(state.step).toBe(1);
    expect(state.isSubmitted).toBe(false);
  });

  // ✅ HAPPY FLOW: resetStore increments resetKey
  it("should increment resetKey on reset", () => {
    const before = useMembershipApplicationStore.getState().resetKey;

    useMembershipApplicationStore.getState().resetStore();

    const after = useMembershipApplicationStore.getState().resetKey;
    expect(after).toBe(before + 1);
  });

  // ✅ HAPPY FLOW: memberValidation state tracking
  it("should start with idle validation status", () => {
    const { memberValidation } = useMembershipApplicationStore.getState();

    expect(memberValidation.validationStatus).toBe("idle");
    expect(memberValidation.attemptCount).toBe(0);
    expect(memberValidation.cooldownEndTime).toBeNull();
  });

  // ✅ HAPPY FLOW: setMemberValidationAttempt
  it("should track validation attempt count", () => {
    useMembershipApplicationStore.getState().setMemberValidationAttempt(2);

    const { memberValidation } = useMembershipApplicationStore.getState();
    expect(memberValidation.attemptCount).toBe(2);
  });

  // ✅ HAPPY FLOW: setMemberValidationStatus stores member info
  it("should store member validation info", () => {
    useMembershipApplicationStore.getState().setMemberValidationStatus(
      "valid",
      {
        companyName: "Acme Corp",
        membershipStatus: "cancelled",
        businessMemberIdentifier: "ibc-mem-abc",
        businessMemberId: "550e8400-e29b-41d4-a716-446655440000",
        applicationMemberType: "corporate",
      },
      "ibc-mem-abc",
      "renewal",
    );

    const { memberValidation } = useMembershipApplicationStore.getState();
    expect(memberValidation.validationStatus).toBe("valid");
    expect(memberValidation.memberInfo.companyName).toBe("Acme Corp");
    expect(memberValidation.memberInfo.membershipStatus).toBe("cancelled");
    expect(memberValidation.lastValidatedMemberIdentifier).toBe("ibc-mem-abc");
    expect(memberValidation.lastValidatedApplicationType).toBe("renewal");
  });

  // ✅ HAPPY FLOW: resetMemberValidation
  it("should reset member validation to idle", () => {
    useMembershipApplicationStore
      .getState()
      .setMemberValidationStatus("valid", { companyName: "Acme Corp" });

    useMembershipApplicationStore.getState().resetMemberValidation();

    const { memberValidation } = useMembershipApplicationStore.getState();
    expect(memberValidation.validationStatus).toBe("idle");
    expect(memberValidation.memberInfo).toEqual({});
  });

  // ✅ HAPPY FLOW: setMemberValidationCooldown
  it("should set cooldown end time", () => {
    const endTime = Date.now() + 900000;
    useMembershipApplicationStore
      .getState()
      .setMemberValidationCooldown(endTime);

    const { memberValidation } = useMembershipApplicationStore.getState();
    expect(memberValidation.cooldownEndTime).toBe(endTime);
  });
});
