import { QrCode } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import type { EventWithStatus } from "../types/event";
import DeleteButton from "./delete-button";

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  const imageUrl = event.eventHeaderUrl?.trim();
  return (
    <article className="bg-white rounded-lg shadow-sm border overflow-hidden flex items-center gap-4 p-4">
      <div className="relative w-32 h-32 shrink-0 flex-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.eventTitle || "Event image"}
            className="w-full h-full object-cover rounded"
            width={128}
            height={128}
            priority={false}
            sizes="(max-width: 768px) 100vw, 128px"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="text-xs px-2 py-1 rounded-full bg-black text-white capitalize">
            {event.computedStatus}
          </span>
        </div>
      </div>

      <div className="flex-4 flex flex-col gap-2 w-96">
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize whitespace-nowrap">
            {event.eventType}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-tight line-clamp-1">
          {event.eventTitle}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-1">
          {event.description}
        </p>
      </div>

      <Separator orientation="vertical" className="h-48 border-y-12" />

      <div className="flex flex-col gap-2 text-sm text-gray-700 min-w-0 flex-3 pr-2">
        <div>
          <span className="text-xs text-gray-500 block">Venue</span>
          <span className="text-sm line-clamp-1">{event.venue}</span>
        </div>
        <div className="flex flex-row justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Start</span>
            <span className="text-sm">{event.eventStartDate}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">End</span>
            <span className="text-sm">{event.eventEndDate}</span>
          </div>
        </div>
      </div>
      <Separator orientation="vertical" className="h-16" />
      <p className="text-sm text-blue-600 font-semibold w-28 flex-1">
        ₱{event.registrationFee}
      </p>

      <div className="flex items-center gap-2 shrink-0 flex-2">
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            className="inline-flex justify-center px-3 py-2 rounded bg-primary text-white text-sm hover:bg-gray-800"
          >
            View Details
          </button>
          <button
            type="button"
            className="w-12 inline-flex justify-center px-3 py-2 rounded border text-sm hover:bg-gray-50"
          >
            <QrCode size={16} />
          </button>
        </div>
        {event.computedStatus === "draft" && (
          <DeleteButton id={event.eventId} />
        )}
      </div>
    </article>
  );
}
