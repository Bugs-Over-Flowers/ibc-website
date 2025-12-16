"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { staggerContainer } from "@/lib/animations/stagger";
import { getEventCategory } from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";
import { EventCard } from "./EventCard";
import { EventsSearch } from "./EventSearch";
import { FeaturedEventList } from "./FeaturedEventList";

type Event = Tables<"Event">;

import type { EventStatus } from "@/lib/events/eventUtils";

type FilterOption = "all" | EventStatus;

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  const { ongoingEvents, filteredEvents } = useMemo(() => {
    // First filter by search query
    const searchFiltered = events.filter((event) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        event.eventTitle.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query)
      );
    });

    // Separate ongoing events (for featured card)
    const ongoing = searchFiltered.filter(
      (e) => getEventCategory(e) === "ongoing",
    );

    // Filter remaining events based on dropdown selection
    let remaining = searchFiltered.filter(
      (e) => getEventCategory(e) !== "ongoing",
    );

    if (filter === "upcoming") {
      remaining = remaining.filter((e) => getEventCategory(e) === "upcoming");
    } else if (filter === "past") {
      remaining = remaining.filter((e) => getEventCategory(e) === "past");
    }

    // Sort: upcoming by date ascending, past by date descending
    remaining.sort((a, b) => {
      const catA = getEventCategory(a);
      const catB = getEventCategory(b);

      // Put upcoming before past in "all" view
      if (filter === "all") {
        if (catA === "upcoming" && catB === "past") return -1;
        if (catA === "past" && catB === "upcoming") return 1;
      }

      // Sort by date
      const dateA = new Date(a.eventStartDate || 0).getTime();
      const dateB = new Date(b.eventStartDate || 0).getTime();

      if (catA === "past" && catB === "past") {
        return dateB - dateA; // Most recent past first
      }
      return dateA - dateB; // Soonest upcoming first
    });

    return { ongoingEvents: ongoing, filteredEvents: remaining };
  }, [events, searchQuery, filter]);

  const EmptyState = () => (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full py-16 text-center"
      initial={{ opacity: 0 }}
    >
      <div className="mx-auto max-w-md rounded-2xl bg-white/60 p-12 shadow-lg ring-1 ring-white/50 backdrop-blur-xl">
        <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="mb-2 font-bold text-foreground text-xl">
          No Events Found
        </h3>
        <p className="text-muted-foreground">
          {searchQuery
            ? "Try adjusting your search terms"
            : "Check back soon for new events"}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section className="relative overflow-hidden py-12">
      {/* Background Blur Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        className="absolute right-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {ongoingEvents.length > 0 && (
          <FeaturedEventList events={ongoingEvents} />
        )}

        {/* Section Header for Other Events */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-bold text-2xl text-foreground md:text-3xl">
            {filter === "upcoming"
              ? "Upcoming Events"
              : filter === "past"
                ? "Past Events"
                : "Explore All Events"}
          </h2>
        </motion.div>
        <div className="mb-12">
          <EventsSearch
            onSearchChange={setSearchQuery}
            onStatusChange={setFilter}
            searchQuery={searchQuery}
            statusFilter={filter}
          />
        </div>
        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            variants={staggerContainer}
          >
            {filteredEvents.map((event, index) => (
              <EventCard event={event} index={index} key={event.eventId} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
