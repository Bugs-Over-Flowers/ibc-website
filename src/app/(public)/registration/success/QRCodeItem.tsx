import Image from "next/image";
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";

interface QRCodeItemProps {
  encodedRegistrationData: string;
}

export default async function QRCodeItem({
  encodedRegistrationData,
}: QRCodeItemProps) {
  const imageURL = await generateQRDataUrl(encodedRegistrationData);
  return <Image src={imageURL} alt="QR Code" fill />;
}
