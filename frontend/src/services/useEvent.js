import { useEffect, useState } from "react";
import { apiFetch } from "./api";

// Loads one event + its details (stalls, gallery…) from the server
export default function useEvent(eventId) {
  const [state, setState] = useState({ loading: true, event: null, details: null, id: eventId });

  useEffect(() => {
    let alive = true;
    apiFetch(`/events/${encodeURIComponent(eventId)}`, { role: "organiser" })
      .then((data) => alive && setState({ loading: false, event: data.event, details: data.details, id: eventId }))
      .catch(() => alive && setState({ loading: false, event: null, details: null, id: eventId }));
    return () => {
      alive = false;
    };
  }, [eventId]);

  // while a new id loads, don't show the previous event
  if (state.id !== eventId) return { loading: true, event: null, details: null };
  return state;
}
