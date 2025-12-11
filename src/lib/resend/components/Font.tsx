import { Font } from "@react-email/components";

export default function CustomFont() {
  return (
    <Font
      fallbackFontFamily="Helvetica"
      fontFamily="Inter"
      fontStyle="normal"
      fontWeight={300}
      webFont={{
        url: "https://fonts.gstatic.com/s/inter/v20/UcCo3FwrK3iLTcviYwYZ8UA3.woff2",
        format: "woff2",
      }}
    />
  );
}
