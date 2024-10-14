"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  BusClass,
  BussesReturn,
  createFormData,
  FilterProps,
  SortOrderProps,
  updateFormData,
} from "@/types/fleet";
import { revalidatePath } from "next/cache";

export async function createbus(
  formData: createFormData
): Promise<boolean | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId || !session.operatorId) {
      return null;
    }

    if (!formData.capacity) {
      return null;
    }

    const busClassEnumValue: BusClass =
      BusClass[formData.busClass as keyof typeof BusClass];

    const bus = await db.busses.create({
      data: {
        name: formData.name,
        busID: formData.iden,
        registration: formData.regNumber,
        capacity: formData.capacity,
        busClass: busClassEnumValue,
        homeBase: formData.location,
        driverName: formData.driver,
        comments: formData.comments,
        operatorIds: [session.operatorId],
      },
    });

    if (!bus) {
      return null;
    }
    revalidatePath("/app/fleet");
    return true;
  } catch (error) {
    console.error("Error creating bus:", error);
    return null;
  }
}

export async function getAllFleet(searchParams: {
  carrier?: string;
  busID?: string;
  busClass?: BusClass;
  registration?: string;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<BussesReturn | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      carrier,
      busID,
      busClass,
      registration,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const filter: FilterProps = {};
    if (busID) {
      filter.busID = { contains: busID, mode: "insensitive" };
    }
    if (registration) {
      filter.registration = { contains: registration, mode: "insensitive" };
    }
    if (busClass) {
      filter.busClass = busClass;
    }

    const sortOrder: SortOrderProps[] = [];
    if (sort) {
      const [field, order] = sort.split("_");

      if (
        field === "busID" ||
        field === "driverName" ||
        field === "registration" ||
        field === "capacity" ||
        field === "class"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    }

    const bussesData = await db.busses.findMany({
      where: filter,
      orderBy: sortOrder,
      skip,
      take,
    });

    if (!bussesData) {
      return null;
    }

    const totalCount = await db.busses.count({ where: filter });

    return {
      bussData: bussesData,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error("Error getting all buses:", error);
    return null;
  }
}

export async function updateBus(
  formData: updateFormData,
  id: string
): Promise<boolean | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    if (!formData.capacity) {
      return null;
    }

    const busClassEnumValue: BusClass =
      BusClass[formData.busClass as keyof typeof BusClass];

    const bus = await db.busses.update({
      where: {
        id: id,
      },
      data: {
        name: formData.name,
        busID: formData.iden,
        registration: formData.regNumber,
        capacity: formData.capacity,
        busClass: busClassEnumValue,
        homeBase: formData.location,
        driverName: formData.driver,
        comments: formData.comments,
      },
    });

    console.log("bus", bus);
    if (!bus) {
      return null;
    }
    revalidatePath("/app/fleet");
    return true;
  } catch (error) {
    console.error("Error creating bus:", error);
    return null;
  }
}
