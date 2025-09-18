// components/AgeVerificationModal.tsx - Professional polished design
import React, { useState, useEffect } from "react";
import { useWebAuthn } from "../hooks/useWebAuthn";

interface AgeVerificationModalProps {
  onVerify: (jwt: string) => void;
  onCancel?: () => void;
}

interface ErrorState {
  type: "network" | "webauthn" | "validation" | "age" | "system" | null;
  message: string;
  canRetry: boolean;
  details?: string;
}

export default function AgeVerificationModal({
  onVerify,
  onCancel,
}: AgeVerificationModalProps) {
  const {
    merchantToken,
    signedKycToken,
    isCreatingToken,
    isVerifying,
    error: hookError,
    showMerchantToken,
    tokenCopied,
    createToken,
    verifyToken,
    setSignedKycToken,
    copyToken,
  } = useWebAuthn();

  const [errorState, setErrorState] = useState<ErrorState>({
    type: null,
    message: "",
    canRetry: false,
  });
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (hookError) {
      processError(hookError);
    } else {
      setErrorState({ type: null, message: "", canRetry: false });
    }
  }, [hookError]);

  const processError = (error: string) => {
    let errorType: ErrorState["type"] = "system";
    let canRetry = false;
    let details = "";

    if (
      error.includes("WebAuthn") ||
      error.includes("PassKey") ||
      error.includes("canceled") ||
      error.includes("cancelled")
    ) {
      errorType = "webauthn";
      canRetry = true;
      details =
        "Authentication was cancelled or your device doesn't support biometric authentication.";
    } else if (
      error.includes("network") ||
      error.includes("fetch") ||
      error.includes("connection")
    ) {
      errorType = "network";
      canRetry = true;
      details = "Please check your internet connection and try again.";
    } else if (
      error.includes("age") ||
      error.includes("21") ||
      error.includes("under")
    ) {
      errorType = "age";
      canRetry = false;
      details = "You must be 21 or older to access this content.";
    } else if (
      error.includes("invalid") ||
      error.includes("expired") ||
      error.includes("token")
    ) {
      errorType = "validation";
      canRetry = true;
      details =
        "The verification token may be expired or invalid. Please try the process again.";
    }

    setErrorState({
      type: errorType,
      message: error,
      canRetry,
      details,
    });
  };

  const handleCreateMerchantToken = async () => {
    setErrorState({ type: null, message: "", canRetry: false });
    try {
      await createToken();
    } catch (error) {
      // Error will be handled by useEffect
    }
  };

  const handleVerifySignedToken = async () => {
    setErrorState({ type: null, message: "", canRetry: false });
    try {
      const result = await verifyToken();
      if (result.success && result.jwt) {
        onVerify(result.jwt);
      }
    } catch (error) {
      // Error will be handled by useEffect
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setErrorState({ type: null, message: "", canRetry: false });

    if (isCreatingToken) {
      handleCreateMerchantToken();
    } else if (isVerifying) {
      handleVerifySignedToken();
    }
  };

  const handleExit = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "https://www.google.com";
    }
  };

  const handleSignedTokenChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setSignedKycToken(e.target.value);
    if (errorState.type === "validation") {
      setErrorState({ type: null, message: "", canRetry: false });
    }
  };

  const dismissError = () => {
    setErrorState({ type: null, message: "", canRetry: false });
  };

  // Professional loading spinner
  const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
    };

    return (
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div
          className="w-full h-full rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--warm-orange)",
            borderRightColor: "var(--warm-orange)",
          }}
        />
      </div>
    );
  };

  // Clean step status
  const getStepStatus = () => {
    return {
      step1: showMerchantToken
        ? "completed"
        : isCreatingToken
          ? "loading"
          : "pending",
      step2: showMerchantToken ? "active" : "pending",
      step3: signedKycToken.trim()
        ? isVerifying
          ? "loading"
          : "ready"
        : "pending",
    };
  };

  const stepStatus = getStepStatus();

  // Professional step indicator
  const StepIndicator = ({
    stepNumber,
    status,
    isLast = false,
  }: {
    stepNumber: number;
    status: string;
    isLast?: boolean;
  }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "completed":
          return {
            bg: "var(--warm-orange)",
            color: "white",
            border: "var(--warm-orange)",
          };
        case "loading":
          return {
            bg: "var(--warm-white)",
            color: "var(--warm-orange)",
            border: "var(--warm-orange)",
          };
        case "active":
          return {
            bg: "var(--warm-orange)",
            color: "white",
            border: "var(--warm-orange)",
          };
        case "ready":
          return {
            bg: "var(--warm-brown)",
            color: "white",
            border: "var(--warm-brown)",
          };
        default:
          return {
            bg: "var(--warm-white)",
            color: "var(--text-secondary)",
            border: "var(--border-warm)",
          };
      }
    };

    const styles = getStatusStyles();

    return (
      <div className="flex items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300"
          style={{
            backgroundColor: styles.bg,
            color: styles.color,
            borderColor: styles.border,
          }}
        >
          {status === "loading" ? (
            <LoadingSpinner size="sm" />
          ) : status === "completed" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        {!isLast && (
          <div
            className="w-16 h-0.5 ml-4"
            style={{
              backgroundColor:
                status === "completed"
                  ? "var(--warm-orange)"
                  : "var(--border-warm)",
            }}
          />
        )}
      </div>
    );
  };

  // Enhanced error display
  const ErrorDisplay = ({ mobile = false }: { mobile?: boolean }) => {
    if (!errorState.type) return null;

    const getErrorStyles = () => {
      switch (errorState.type) {
        case "age":
          return { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" };
        case "webauthn":
          return { bg: "#fffbeb", border: "#fed7aa", text: "#d97706" };
        case "network":
          return { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb" };
        case "validation":
          return { bg: "#fff7ed", border: "#fdba74", text: "#ea580c" };
        default:
          return { bg: "#f9fafb", border: "#d1d5db", text: "#6b7280" };
      }
    };

    const styles = getErrorStyles();

    return (
      <div
        className="mt-6 p-4 rounded-lg border transition-all duration-300"
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
          color: styles.text,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: styles.text }}
              />
              <h4 className="font-semibold text-sm">
                {errorState.type === "age" && "Age Verification Failed"}
                {errorState.type === "webauthn" && "Authentication Issue"}
                {errorState.type === "network" && "Connection Problem"}
                {errorState.type === "validation" && "Verification Error"}
                {errorState.type === "system" && "System Error"}
              </h4>
            </div>
            <p className="text-sm mb-3">{errorState.message}</p>

            {errorState.details && (
              <div className="text-xs">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="underline hover:no-underline font-medium"
                >
                  {showErrorDetails ? "Hide details" : "Show details"}
                </button>
                {showErrorDetails && (
                  <div className="mt-2 p-3 rounded bg-white bg-opacity-75 text-xs leading-relaxed">
                    {errorState.details}
                  </div>
                )}
              </div>
            )}

            {errorState.canRetry && (
              <div className="mt-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors"
                  style={{ borderColor: styles.text }}
                >
                  Retry {retryCount > 0 && `(${retryCount + 1})`}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={dismissError}
            className="ml-3 p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile: Full screen */}
      <div
        className="fixed inset-0 z-50 flex flex-col sm:hidden"
        style={{ backgroundColor: "var(--warm-white)" }}
      >
        {/* Mobile header - fixed height */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-white"
          style={{ borderColor: "var(--border-warm)" }}
        >
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--warm-brown)" }}
          >
            Age Verification
          </h1>
          <button
            onClick={handleExit}
            disabled={isVerifying || isCreatingToken}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mobile content - scrollable with flex-1 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--warm-orange)" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                Age Verification Required
              </h2>
              <p className="text-base text-gray-600">
                Verify you're 21+ to continue
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center mb-8">
              <StepIndicator stepNumber={1} status={stepStatus.step1} />
              <StepIndicator stepNumber={2} status={stepStatus.step2} />
              <StepIndicator stepNumber={3} status={stepStatus.step3} isLast />
            </div>

            {/* Step 1 */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  1. Generate PassKey
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Create a secure verification token for your bank
              </p>

              <button
                onClick={handleCreateMerchantToken}
                disabled={isCreatingToken || showMerchantToken}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: showMerchantToken
                    ? "var(--warm-brown)"
                    : "var(--warm-orange)",
                  color: "white",
                }}
              >
                {isCreatingToken && <LoadingSpinner />}
                {isCreatingToken
                  ? "Generating..."
                  : showMerchantToken
                    ? "PassKey Generated"
                    : "Generate PassKey"}
              </button>

              {showMerchantToken && (
                <div className="mt-4 animate-in slide-in-from-top duration-300">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--warm-brown)" }}
                  >
                    Your PassKey:
                  </label>
                  <textarea
                    value={merchantToken}
                    readOnly
                    rows={2}
                    className="w-full px-3 py-3 text-sm rounded-lg border font-mono mb-3 bg-gray-50"
                    style={{
                      borderColor: "var(--border-warm)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={copyToken}
                    className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    style={{
                      backgroundColor: tokenCopied
                        ? "var(--warm-brown)"
                        : "var(--warm-orange)",
                      color: "white",
                    }}
                  >
                    {tokenCopied ? "Copied" : "Copy PassKey"}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`mb-6 transition-opacity duration-300 ${showMerchantToken ? "opacity-100" : "opacity-50"}`}
            >
              <div className="flex items-center mb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  2. Bank Verification
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Submit your PassKey to your bank's verification portal
              </p>

              <div
                className="p-4 rounded-lg border text-center"
                style={{
                  borderColor: "var(--warm-orange)",
                  backgroundColor: "var(--warm-cream)",
                }}
              >
                <p className="text-sm text-gray-600 mb-2">Supported Bank:</p>
                <a
                  href={
                    showMerchantToken
                      ? document.location.origin.split(".")[0] +
                        ".ironbank.click"
                      : "#"
                  }
                  className={`text-lg font-bold ${showMerchantToken ? "" : "pointer-events-none opacity-50"}`}
                  style={{ color: "var(--warm-orange)" }}
                  target={showMerchantToken ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  The Iron Bank
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`mb-6 transition-opacity duration-300 ${showMerchantToken ? "opacity-100" : "opacity-50"}`}
            >
              <div className="flex items-center mb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  3. Complete Verification
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Paste the signed token from your bank
              </p>

              <textarea
                value={signedKycToken}
                onChange={handleSignedTokenChange}
                placeholder="Paste signed verification token..."
                rows={3}
                disabled={isVerifying || !showMerchantToken}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors mb-4 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                style={{
                  color: "var(--text-primary)",
                  borderColor:
                    errorState.type === "validation"
                      ? "#dc2626"
                      : "var(--border-warm)",
                }}
                onFocus={(e) => {
                  if (!errorState.type)
                    e.currentTarget.style.borderColor = "var(--warm-orange)";
                }}
                onBlur={(e) => {
                  if (!errorState.type)
                    e.currentTarget.style.borderColor = "var(--border-warm)";
                }}
              />

              <button
                onClick={handleVerifySignedToken}
                disabled={
                  isVerifying || !signedKycToken.trim() || !showMerchantToken
                }
                className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--warm-orange)",
                  color: "white",
                }}
              >
                {isVerifying && <LoadingSpinner />}
                {isVerifying ? "Verifying..." : "Complete Verification"}
              </button>
            </div>

            <ErrorDisplay mobile={true} />

            {/* Info */}
            <div
              className="mt-8 p-4 rounded-lg text-sm leading-relaxed bg-gray-50"
              style={{ borderColor: "var(--border-warm)" }}
            >
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                How it works:
              </h4>
              <p className="text-gray-600">
                Your bank verifies your age using secure WebAuthn technology. No
                personal data is shared directly with this site.
              </p>
            </div>

            {/* Add extra padding at bottom for better scroll experience */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>

      {/* Desktop: Centered modal */}
      <div
        className="hidden sm:flex fixed inset-0 items-start justify-center z-50 p-4 overflow-y-auto"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--warm-orange)" }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--warm-brown)" }}
            >
              Age Verification Required
            </h2>
            <p className="text-lg text-gray-600">
              Verify you're 21+ to continue
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <StepIndicator stepNumber={1} status={stepStatus.step1} />
            <StepIndicator stepNumber={2} status={stepStatus.step2} />
            <StepIndicator stepNumber={3} status={stepStatus.step3} isLast />
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-6">
            {/* Step 1 */}
            <div
              className="p-6 rounded-xl border"
              style={{
                borderColor: "var(--border-warm)",
                backgroundColor: "var(--warm-cream)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                1. Generate PassKey
              </h3>
              <p className="text-gray-600 mb-4">
                Create a secure verification token for your bank
              </p>

              <button
                onClick={handleCreateMerchantToken}
                disabled={isCreatingToken || showMerchantToken}
                className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  backgroundColor: showMerchantToken
                    ? "var(--warm-brown)"
                    : "var(--warm-orange)",
                  color: "white",
                }}
              >
                {isCreatingToken && <LoadingSpinner size="md" />}
                {isCreatingToken
                  ? "Generating..."
                  : showMerchantToken
                    ? "PassKey Generated"
                    : "Generate PassKey"}
              </button>

              {showMerchantToken && (
                <div className="mt-4 animate-in slide-in-from-top duration-300">
                  <div
                    className="p-4 rounded-lg border bg-white"
                    style={{ borderColor: "var(--warm-orange)" }}
                  >
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--warm-brown)" }}
                    >
                      Your PassKey:
                    </label>
                    <textarea
                      value={merchantToken}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-3 text-sm rounded-lg border font-mono mb-3 bg-gray-50"
                      style={{
                        borderColor: "var(--border-warm)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      onClick={copyToken}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      style={{
                        backgroundColor: tokenCopied
                          ? "var(--warm-brown)"
                          : "var(--warm-orange)",
                        color: "white",
                      }}
                    >
                      {tokenCopied ? "Copied to Clipboard" : "Copy PassKey"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`p-6 rounded-xl border transition-opacity duration-300 ${showMerchantToken ? "opacity-100" : "opacity-50"}`}
              style={{
                borderColor: "var(--border-warm)",
                backgroundColor: "var(--warm-cream)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                2. Bank Verification
              </h3>
              <p className="text-gray-600 mb-4">
                Submit your PassKey to your bank's verification portal
              </p>

              <div
                className="p-4 rounded-lg border text-center bg-white"
                style={{ borderColor: "var(--warm-orange)" }}
              >
                <p className="text-sm text-gray-600 mb-2">Supported Bank:</p>
                <a
                  href={
                    showMerchantToken
                      ? document.location.origin.split(".")[0] +
                        ".ironbank.click"
                      : "#"
                  }
                  className={`text-xl font-bold ${showMerchantToken ? "" : "pointer-events-none opacity-50"}`}
                  style={{ color: "var(--warm-orange)" }}
                  target={showMerchantToken ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  The Iron Bank
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-6 rounded-xl border transition-opacity duration-300 ${showMerchantToken ? "opacity-100" : "opacity-50"}`}
              style={{
                borderColor: "var(--border-warm)",
                backgroundColor: "var(--warm-cream)",
              }}
            >
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                3. Complete Verification
              </h3>
              <p className="text-gray-600 mb-4">
                Paste the signed token from your bank
              </p>

              <textarea
                value={signedKycToken}
                onChange={handleSignedTokenChange}
                placeholder="Paste signed verification token here..."
                rows={4}
                disabled={isVerifying || !showMerchantToken}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors mb-4 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                style={{
                  color: "var(--text-primary)",
                  borderColor:
                    errorState.type === "validation"
                      ? "#dc2626"
                      : "var(--border-warm)",
                }}
                onFocus={(e) => {
                  if (!errorState.type)
                    e.currentTarget.style.borderColor = "var(--warm-orange)";
                }}
                onBlur={(e) => {
                  if (!errorState.type)
                    e.currentTarget.style.borderColor = "var(--border-warm)";
                }}
              />

              <button
                onClick={handleVerifySignedToken}
                disabled={
                  isVerifying || !signedKycToken.trim() || !showMerchantToken
                }
                className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  backgroundColor: "var(--warm-orange)",
                  color: "white",
                }}
              >
                {isVerifying && <LoadingSpinner size="md" />}
                {isVerifying ? "Verifying..." : "Complete Verification"}
              </button>
            </div>
          </div>

          <ErrorDisplay />

          {/* Footer */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleExit}
              disabled={isVerifying || isCreatingToken}
              className="w-full px-6 py-3 rounded-lg transition-colors font-medium border disabled:opacity-50"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--border-warm)",
                color: "var(--text-secondary)",
              }}
            >
              I'm Under 21 - Exit
            </button>

            <div className="p-4 rounded-lg text-sm leading-relaxed bg-gray-50">
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--warm-brown)" }}
              >
                Privacy & Security:
              </h4>
              <p className="text-gray-600">
                Your bank verifies your age using secure WebAuthn technology. No
                personal data is shared directly with this site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
