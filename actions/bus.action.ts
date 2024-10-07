// actions/bus.action.ts

"use server";

import { db } from "@/db";

export async function getAllBuses() {
  try {
    const buses = await db.busses.findMany();
    return buses;
  } catch (error) {
    console.error("Error fetching buses:", error);
    return [];
  }
}
