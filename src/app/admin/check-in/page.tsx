import QRCamera from "./_components/QRCamera";
import RegistrationData from "./_components/RegistrationData";

export default function CheckInPage() {
  return (
    <div>
      <h2>Check in page</h2>
      <div className="flex w-full justify-between gap-5">
        <QRCamera />
        <RegistrationData />
      </div>
    </div>
  );
}
