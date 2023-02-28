export type EventCategory = 'tournament' | 'splatfest' | 'big-run' | 'update' | 'ch-event'

export type SplatoonEvent = {name: String, category: EventCategory, url: string, duration?: number}
import events from "../assets/data/events.json";

export const splatoonEvents = events as {[date: string] : SplatoonEvent[]};