import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="110"
        stroke="#0a0d16"
        strokeLinecap="round"
        strokeWidth="2.6"
        viewBox="0 0 24 24"
        width="110"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="7.6" cy="7.6" r="2.4" />
        <circle cx="16.4" cy="16.4" r="2.4" />
        <path d="M9.4 9.4 14.6 14.6" />
      </svg>
    </div>,
    { ...size },
  );
}
