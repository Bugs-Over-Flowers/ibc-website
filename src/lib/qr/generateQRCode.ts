import QRcode from "qrcode";

export const generateQRDataUrl = async (data: string) => {
  const qrData = QRcode.toDataURL(data, {
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#010101", // QR code color
      light: "#FAFAFA", // Background color
    },
  });

  return qrData;
};

export async function generateQRBuffer(data: string) {
  // Generate QR code as Buffer
  const qrBuffer = await QRcode.toBuffer(data, {
    errorCorrectionLevel: "H",
    width: 300,
    margin: 2,
    type: "png",
    color: {
      dark: "#010101", // QR code color
      light: "#FAFAFA", // Background color
    },
  });

  return qrBuffer;
}
