<script lang="ts" setup>
import {
    serializeIso8601String,
    calendarDateFromJsDateObject,
    startOfWeek,
    addDays,
    addMonths,
    isMonthBefore,
    type CalendarDate,
    type CalendarMonth,
} from "typescript-calendar-date";
import type { Month } from "typescript-calendar-date/dist/consts";
import { ref } from "vue";
import { splatoonEvents, type SplatoonEvent, type EventCategory } from "../models/events";
import bigRunSrc from "../assets/imgs/Big_Run.png";
import splatFestSrc from "../assets/imgs/Splatfest_Logo.png";
import splat3Src from "../assets/imgs/splatoon-3.webp";
import splatChSrc from "../assets/imgs/splatoon_ch_icon.png"
import trophySrc from "../assets/imgs/trophy.png";
import { useRoute } from 'vue-router'

type EventDay = { date: CalendarDate; isActive: boolean; events: SplatoonEvent[] };

const route = useRoute();
const now = calendarDateFromJsDateObject(new Date());

let day = { day: 1, month: now.month, year: now.year } as CalendarDate;
const startDay = ref(startOfWeek(day));
const weeksRef = ref<EventDay[][]>();
const currentMonth = ref(now as CalendarMonth);

const printQuery = route.query['print'] as string;
const isPrint = ref(printQuery != null);

function getCategoryImg(category: EventCategory) {
    switch (category) {
        case "big-run":
            return bigRunSrc;
        case "splatfest":
            return splatFestSrc;
        case "tournament":
            return trophySrc;
        case "update":
            return splat3Src;
        case "ch-event":
            return splatChSrc;
    }
}

function loadWeeks(start: CalendarDate, month: CalendarMonth) {
    const weeks = [] as EventDay[][];
    let current = start;

    while (isMonthBefore(current, addMonths(month, 1))) {
        let week = [] as EventDay[];

        for (let i = 0; i < 7; i++) {
            let events = splatoonEvents[serializeIso8601String(current)];
            events = events?.map(e => {
                if(e.duration == null) {
                    e.duration = 1;
                }
                // handle duration over sunday
                else if(i + e.duration > 7){
                    let overflow = ((i + e.duration) - 7);
                    e.duration = e.duration - overflow;
                    let monday = addDays(current, e.duration);
                    let newE = {...e, duration: overflow} as SplatoonEvent;

                    if(splatoonEvents[serializeIso8601String(monday)] == null){
                        splatoonEvents[serializeIso8601String(monday)] = [];
                    }
                    splatoonEvents[serializeIso8601String(monday)].push(newE);
                }

                return e;
            });

            week.push({ date: current, isActive: current.month == month.month, events: events });
            current = addDays(current, 1);
        }

        weeks.push(week);
    }

    weeksRef.value = weeks;
    currentMonth.value = month;
}

function monthToString(month: Month){
    switch(month){
        case "jan": return "January";
        case "feb": return "February";
        case "mar": return "March";
        case "apr": return "April";
        case "may": return "May";
        case "jun": return "June";
        case "jul": return "July";
        case "aug": return "August";
        case "aug": return "August";
        case "sep": return "September";
        case "oct": return "October";
        case "nov": return "November";
        case "dec": return "December";
        default: return month;
    }
}

function changeMonthRelative(direction: number) {
    let newMonth = addMonths(currentMonth.value, direction);
    startDay.value = startOfWeek({ day: 1, ...newMonth });
    loadWeeks(startDay.value, newMonth);
}

function getWidth(event: SplatoonEvent){
    let duration = event.duration ?? 1;
    let w = duration * 100;
    return w + "%";
}

loadWeeks(startDay.value, now);
</script>

<template>
    <h1 class="text-center">
        <a v-if="!isPrint" v-on:click="changeMonthRelative(-1)">
            <i-material-symbols-arrow-back-ios-new-rounded />
        </a>
        {{ monthToString(currentMonth.month) }} {{ currentMonth.year }}
        <a v-if="!isPrint" v-on:click="changeMonthRelative(1)">
            <i-material-symbols-arrow-back-ios-new-rounded class="rotate-180" />
        </a>
        <a v-if="!isPrint" class="float-right color-white" v-on:click="isPrint = true"><i-ri-screenshot-2-fill class="h-20px"/></a>
    </h1>

    <div class="flex flex-col">
        <div class="flex flex-row calendar-head">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
        </div>
        <div class="flex flex-row calendar-row" v-for="week in weeksRef">
            <div v-for="eventDay in week" :class="{ 'calendar-cell': true, inactive: !eventDay.isActive }">
                <span class="day-number">{{ eventDay.date.day }}</span>
                <div class="flex flex-col" v-for="event in eventDay.events">
                    <a :href="event.url" target="_blank">
                        <div :class="['flex', 'event', event.category]" :style="{width: getWidth(event)}">
                            <img :src="getCategoryImg(event.category)" />
                            <span>{{ event.name }}</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
$boderColor: rgb(105, 105, 105);

$bigRunBg: violet;
$splatfestBg: rgb(211, 167, 47);
$tournamentBg: rgba(6, 97, 6, 0.753);
$updateBg: rgb(48, 48, 170);
$chEvent: rgb(156, 61, 85);

$gap: 0px;

* {
    font-family: Overpass, sans-serif;
}

.calendar-head {
    div {
        width: 100%;
        text-align: center;
    }
}

.calendar-row {
    height: 100px;
    gap: $gap;
    margin-bottom: $gap;
}

.calendar-cell {
    width: 100%;
    height: 100%;
    min-width: 50px;
    border: 1px $boderColor solid;
    text-align: center;
    // border-radius: 5px;
}

.inactive {
    background-color: gray !important;
}

.day-number {
    color: rgb(255, 255, 255);
}

.calendar-cell:nth-child(odd) {
    background-color: desaturate(#ffff3e, 60);
}

.calendar-cell:nth-child(even) {
    background-color: desaturate(#6542fd, 60);
}

.event {
    width: 90%;
    border-radius: 5px;
    margin: auto;
    margin-top: 5px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border: 2px solid white;
    color: white;
    text-decoration: none;
    overflow: hidden;
    font-size: 0.8em;
    position: relative;

    @media only screen and (max-width: 640px) {
        white-space: nowrap;
    }
    // box-shadow: 2px 2px black;

    img {
        width: 15px;
        margin-left: 0.5rem;
    }

    span {
        margin: auto;
        font-weight: 600;
        padding: 3px;
        // text-align: left;
    }
}

.big-run {
    background-color: $bigRunBg;
}

.splatfest {
    background-color: $splatfestBg;
}

.tournament {
    background-color: $tournamentBg;
}

.update{
    background-color: $updateBg;
}

.ch-event{
    background-color: $chEvent;
}

a:link {
    text-decoration: none;
}

a:visited {
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}

a:active {
    text-decoration: none;
}
</style>
