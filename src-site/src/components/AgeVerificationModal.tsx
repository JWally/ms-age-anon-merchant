// components/AgeVerificationModal.tsx - Properly styled version
import React from "react";
import { useWebAuthn } from "../hooks/useWebAuthn";

interface AgeVerificationModalProps {
  onVerify: (jwt: string) => void;
  onCancel?: () => void;
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
    error,
    showMerchantToken,
    tokenCopied,
    createToken,
    verifyToken,
    setSignedKycToken,
    copyToken,
  } = useWebAuthn();

  const handleCreateMerchantToken = () => createToken();

  const handleVerifySignedToken = async () => {
    const result = await verifyToken();
    if (result.success && result.jwt) {
      onVerify(result.jwt);
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
  };

  return (
    <>
      {/* Mobile: Full screen */}
      <div className="fixed inset-0 z-50 sm:hidden overflow-y-auto warm-gradient">
        {/* Mobile header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
          style={{
            backgroundColor: "var(--warm-white)",
            borderColor: "var(--border-warm)",
          }}
        >
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--warm-brown)" }}
          >
            Age Verification
          </h1>
          <button
            onClick={handleExit}
            disabled={isVerifying || isCreatingToken}
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!isVerifying && !isCreatingToken) {
                e.currentTarget.style.backgroundColor = "var(--warm-cream)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ✕
          </button>
        </div>

        {/* Mobile content */}
        <div className="p-4 pb-8">
          {/* Hero section */}
          <div className="text-center mb-6">
            <div
              className="text-5xl mb-3"
              style={{ color: "var(--warm-orange)" }}
            >
              🔞
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You must be 21+ to enter HornPub
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--warm-white)",
                border: "1px solid var(--border-warm)",
              }}
            >
              <div className="flex items-center mb-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3"
                  style={{
                    backgroundColor: showMerchantToken
                      ? "var(--warm-orange)"
                      : "var(--border-warm)",
                    color: showMerchantToken
                      ? "white"
                      : "var(--text-secondary)",
                  }}
                >
                  {showMerchantToken ? "✓" : "1"}
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Create Verification Token
                </h3>
              </div>

              <button
                onClick={handleCreateMerchantToken}
                disabled={isCreatingToken || showMerchantToken}
                className="w-full btn-warm-primary px-4 py-3 rounded-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isCreatingToken
                  ? "Creating Token..."
                  : showMerchantToken
                    ? "Token Created ✓"
                    : "Create Merchant Token"}
              </button>

              {showMerchantToken && (
                <div className="mt-4">
                  <textarea
                    value={merchantToken}
                    readOnly
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded border font-mono mb-3"
                    style={{
                      backgroundColor: "var(--warm-cream)",
                      borderColor: "var(--border-warm)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={copyToken}
                    className="w-full btn-warm-primary px-4 py-2 rounded-lg transition-all duration-300 font-semibold text-sm"
                    style={{
                      backgroundColor: tokenCopied
                        ? "var(--warm-brown)"
                        : "var(--warm-orange)",
                      color: "white",
                    }}
                  >
                    {tokenCopied ? "Copied!" : "Copy Token"}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--warm-white)",
                border: "1px solid var(--border-warm)",
              }}
            >
              <div className="flex items-center mb-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3"
                  style={{
                    backgroundColor: "var(--border-warm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  2
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Get Bank Verification
                </h3>
              </div>

              <div
                className="space-y-2 text-xs mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>• Go to your bank's online portal</p>
                <p>• Find "Age Verification" or "KYC Attestation"</p>
                <p>• Paste your merchant token there</p>
                <p>• Copy the returned signed token</p>
              </div>

              <div
                className="p-3 rounded text-center"
                style={{
                  backgroundColor: "var(--warm-cream)",
                  border: "1px solid var(--warm-orange)",
                }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Supported Bank:
                </p>
                <a
                  href={
                    document.location.origin.split(".")[0] + ".ironbank.click"
                  }
                  className="text-sm font-bold"
                  style={{
                    color: "var(--warm-orange)",
                    textDecoration: "underline",
                  }}
                >
                  THE IRON BANK
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--warm-white)",
                border: "1px solid var(--border-warm)",
              }}
            >
              <div className="flex items-center mb-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3"
                  style={{
                    backgroundColor: "var(--border-warm)",
                    color: "var(--text-secondary)",
                  }}
                >
                  3
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Complete Verification
                </h3>
              </div>

              <label
                className="block mb-2 font-medium text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Paste signed token from your bank:
              </label>

              <textarea
                value={signedKycToken}
                onChange={handleSignedTokenChange}
                placeholder="Paste the signed token here..."
                rows={3}
                className="w-full px-3 py-3 rounded-lg border-2 focus:outline-none transition-colors mb-4 font-mono text-xs"
                style={{
                  backgroundColor: "var(--warm-cream)",
                  color: "var(--text-primary)",
                  borderColor: error ? "#dc2626" : "var(--border-warm)",
                }}
                onFocus={(e) => {
                  if (!error)
                    e.currentTarget.style.borderColor = "var(--warm-orange)";
                }}
                onBlur={(e) => {
                  if (!error)
                    e.currentTarget.style.borderColor = "var(--border-warm)";
                }}
                disabled={isVerifying}
              />

              <button
                onClick={handleVerifySignedToken}
                disabled={isVerifying || !signedKycToken.trim()}
                className="w-full btn-warm-primary px-4 py-3 rounded-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isVerifying
                  ? "Verifying with Bank..."
                  : "Complete Age Verification"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          {/* Info section */}
          <div
            className="mt-6 p-4 rounded-lg text-xs"
            style={{
              backgroundColor: "var(--warm-cream)",
              border: "1px solid var(--border-warm)",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              <strong>How this works:</strong> Your bank verifies your age using
              their existing KYC data. The verification uses WebAuthn (device
              security) to prevent sharing credentials. Your bank never shares
              data directly with this site.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Centered modal */}
      <div
        className="hidden sm:flex fixed inset-0 items-center justify-center z-50 overflow-y-auto py-8 px-4"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          className="warm-card-gradient p-6 lg:p-8 rounded-xl text-center w-full max-w-lg lg:max-w-2xl shadow-2xl my-auto"
          style={{ border: "2px solid var(--warm-orange)" }}
        >
          <div className="mb-6">
            <div
              className="text-5xl lg:text-6xl mb-4"
              style={{ color: "var(--warm-orange)" }}
            >
              🔞
            </div>
            <h2
              className="text-2xl lg:text-3xl font-bold mb-2"
              style={{ color: "var(--warm-brown)" }}
            >
              Age Verification Required
            </h2>
            <p
              className="text-base lg:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              You must be 21+ to enter HornPub
            </p>
          </div>

          {/* Step 1: Create Merchant Token */}
          <div
            className="mb-6 p-4 lg:p-6 rounded-lg"
            style={{
              backgroundColor: "var(--warm-cream)",
              border: "1px solid var(--border-warm)",
            }}
          >
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--warm-brown)" }}
            >
              Step 1: Create Verification Token
            </h3>

            <button
              onClick={handleCreateMerchantToken}
              disabled={isCreatingToken || showMerchantToken}
              className="w-full btn-warm-primary px-6 py-3 rounded-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingToken
                ? "Creating Token..."
                : showMerchantToken
                  ? "Token Created ✓"
                  : "Create Merchant Token"}
            </button>

            {showMerchantToken && (
              <>
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--warm-white)",
                    border: "1px solid var(--warm-orange)",
                  }}
                >
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Copy this token to your bank's age verification service:
                  </p>
                  <div className="flex gap-2">
                    <textarea
                      value={merchantToken}
                      readOnly
                      rows={3}
                      className="flex-1 px-3 py-2 text-xs rounded border font-mono"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        borderColor: "var(--border-warm)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={copyToken}
                  className="w-full btn-warm-primary px-6 py-3 mt-3 rounded-lg transition-all duration-300 font-semibold"
                  style={{
                    backgroundColor: tokenCopied
                      ? "var(--warm-brown)"
                      : "var(--warm-orange)",
                    color: "white",
                  }}
                >
                  {tokenCopied ? "Copied!" : "Copy"}
                </button>
              </>
            )}
          </div>

          {/* Step 2-3: External KYC Process */}
          <div
            className="mb-6 p-4 lg:p-6 rounded-lg"
            style={{
              backgroundColor: "var(--warm-cream)",
              border: "1px solid var(--border-warm)",
            }}
          >
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--warm-brown)" }}
            >
              Step 2: Get Bank Verification
            </h3>
            <ol
              className="text-left text-sm space-y-2 mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>1. Go to your bank's online portal</li>
              <li>
                2. Find the "Age Verification" or "KYC Attestation" section
              </li>
              <li>3. Paste your merchant token there</li>
              <li>4. Your bank will return a signed verification token</li>
              <li>5. Copy that signed token and paste it below</li>
            </ol>

            <div
              className="p-3 rounded text-xs"
              style={{
                backgroundColor: "var(--warm-white)",
                border: "1px solid var(--warm-orange)",
              }}
            >
              <strong>Supported Banks: </strong>
              <a
                href={
                  document.location.origin.split(".")[0] + ".ironbank.click"
                }
                style={{
                  color: "var(--warm-orange)",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--warm-orange)";
                }}
              >
                THE IRON BANK
              </a>
            </div>
          </div>

          {/* Step 4: Paste Signed Token */}
          <div
            className="mb-6 p-4 lg:p-6 rounded-lg"
            style={{
              backgroundColor: "var(--warm-cream)",
              border: "1px solid var(--border-warm)",
            }}
          >
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--warm-brown)" }}
            >
              Step 3: Complete Verification
            </h3>

            <label
              className="block text-left mb-2 font-medium text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Paste signed token from your bank:
            </label>
            <textarea
              value={signedKycToken}
              onChange={handleSignedTokenChange}
              placeholder="Paste the signed token here..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors mb-4 font-mono text-xs"
              style={{
                backgroundColor: "var(--warm-white)",
                color: "var(--text-primary)",
                borderColor: error ? "#dc2626" : "var(--border-warm)",
              }}
              onFocus={(e) => {
                if (!error)
                  e.currentTarget.style.borderColor = "var(--warm-orange)";
              }}
              onBlur={(e) => {
                if (!error)
                  e.currentTarget.style.borderColor = "var(--border-warm)";
              }}
              disabled={isVerifying}
            />

            <button
              onClick={handleVerifySignedToken}
              disabled={isVerifying || !signedKycToken.trim()}
              className="w-full btn-warm-primary px-6 py-3 rounded-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying
                ? "Verifying with Bank..."
                : "Complete Age Verification"}
            </button>
          </div>

          {/* Error message */}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {/* Exit button */}
          <button
            onClick={handleExit}
            disabled={isVerifying || isCreatingToken}
            className="w-full px-6 py-3 rounded-lg transition-colors font-medium border-2"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-warm)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!isVerifying && !isCreatingToken) {
                e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                e.currentTarget.style.color = "var(--warm-brown)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            I'm Under 21 - Exit
          </button>

          {/* Info section */}
          <div
            className="mt-6 p-4 rounded-lg text-xs text-left"
            style={{
              backgroundColor: "var(--warm-cream)",
              border: "1px solid var(--border-warm)",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              <strong>How this works:</strong> Your bank verifies your age using
              their existing KYC data. The verification uses WebAuthn (device
              security) to prevent sharing credentials. Your bank never shares
              data directly with this site - you control what information is
              shared.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
