"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { staggerContainer } from "@/components/animations/stagger";
import { getEventCategory } from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";
import { EventCard } from "./EventCard";
import { EventsSearch } from "./EventSearch";
import { FeaturedEventList } from "./FeaturedEventList";

type Event = Tables<"Event">;

type FilterOption = "all" | "upcoming" | "past";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 col-span-full"
    >
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 shadow-lg ring-1 ring-white/50 max-w-md mx-auto">
        <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">
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
    <section className="py-12 relative overflow-hidden">
      {/* Background Blur Orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {ongoingEvents.length > 0 && (
          <FeaturedEventList events={ongoingEvents} />
        )}

        {/* Section Header for Other Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {filter === "upcoming"
              ? "Upcoming Events"
              : filter === "past"
                ? "Past Events"
                : "Explore All Events"}
          </h2>
        </motion.div>
        <div className="mb-12">
          <EventsSearch
            onSearch={setSearchQuery}
            onFilterChange={setFilter}
            currentFilter={filter}
          />
        </div>
        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
