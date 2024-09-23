"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { City } from "@/types/city";
import { Cities, Operators } from "@prisma/client";

export async function getAllMatchedCity(): Promise<Cities[] | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const cities = await db.cities.findMany();

    return cities;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllOperators(): Promise<
  Operators[] | undefined | null
> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operators = await db.operators.findMany();

    if (!operators) {
      return null;
    }

    return operators;
  } catch (error) {
    console.error(error);
    return null;
  }
}
