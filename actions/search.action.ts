"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { City } from "@/types/city";
import { Cities, Operators, Countries } from "@prisma/client";
import { OperatorsType } from "@/types/transactions";
import { OperatorStatus } from "@/types/operator";

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

export async function getAllOperators(): Promise<OperatorsType[] | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operatorsData = await db.operators.findMany();

    if (!operatorsData) {
      return null;
    }

    const operators = operatorsData.map((operator) => ({
      ...operator,
      status: operator.status ?? OperatorStatus.INVITED,
    }));

    return operators || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllCountries(): Promise<Countries[] | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const countries = await db.countries.findMany();

    return countries;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAlKupiOperators(): Promise<OperatorsType[] | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operatorsData = await db.operators.findMany({
      where: {
        source: "KUPI",
        status: "REGISTERED",
      },
    });

    if (!operatorsData) {
      return null;
    }

    const operators = operatorsData.map((operator) => ({
      ...operator,
      status: operator.status ?? OperatorStatus.INVITED,
    }));

    return operators || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
