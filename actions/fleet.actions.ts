"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  BusClass,
  BussesReturn,
  createFormData,
  errorType,
  FilterProps,
  SortOrderProps,
  updateFormData,
} from "@/types/fleet";
import { revalidatePath } from "next/cache";
import { RolesEnum } from "@/types/auth";

export async function createbus(
  formData: createFormData
): Promise<boolean | string | null | undefined | errorType> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    if (!formData.capacity) {
      return null;
    }

    const busses = await db.busses.findMany();
    const registration = busses.find(
      (bus) => bus.registration === formData.regNumber
    );
    const busNumber = busses.find((bus) => bus.busID === formData.iden);

    if (registration) {
      return {
        name: "registration",
        error: "Duplication registration number",
      };
    }

    if (busNumber) {
      return {
        name: "busNumber",
        error: "Duplication bus number",
      };
    }

    const busClassEnumValue: BusClass =
      BusClass[formData.busClass as keyof typeof BusClass];

    let bus = null;
    if (
      session.role === RolesEnum.SuperAdmin &&
      formData.busOperator !== undefined
    ) {
      bus = await db.busses.create({
        data: {
          name: formData.name,
          busID: formData.iden,
          registration: formData.regNumber,
          capacity: formData.capacity,
          busClass: busClassEnumValue,
          homeBase: formData.location,
          driverName: formData.driver,
          comments: formData.comments || "",
          operatorId: formData.busOperator,
        },
      });
    } else if (
      session.operatorId &&
      session.role === RolesEnum.BusCompanyAdmin
    ) {
      bus = await db.busses.create({
        data: {
          name: formData.name,
          busID: formData.iden,
          registration: formData.regNumber,
          capacity: formData.capacity,
          busClass: busClassEnumValue,
          homeBase: formData.location,
          driverName: formData.driver,
          comments: formData.comments || "",
          operatorId: session.operatorId,
        },
      });
    }

    if (!bus) {
      return null;
    }
    revalidatePath("/app/fleet");
    return "success";
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
      filter.registration = registration;
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
        field === "busClass"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ createdAt: "desc" });
    }

    let bussesData;
    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      bussesData = await db.busses.findMany({
        where: filter,
        orderBy: sortOrder,
        skip,
        take,
      });
    } else if (session.role === RolesEnum.BusCompanyAdmin) {
      bussesData = await db.busses.findMany({
        where: {
          AND: [filter, { operatorId: session.operatorId }],
        },
        orderBy: sortOrder,
        skip,
        take,
      });
    }

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
): Promise<boolean | null | undefined | errorType | string> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    if (!formData.capacity) {
      return null;
    }

    const busses = await db.busses.findMany();
    const registration = busses.find(
      (bus) => bus.registration === formData.regNumber && bus.id !== id
    );

    const busNumber = busses.find(
      (bus) => bus.busID === formData.iden && bus.id !== id
    );

    if (registration) {
      return {
        name: "registration",
        error: "Duplication registration number",
      };
    }

    if (busNumber) {
      return {
        name: "busNumber",
        error: "Duplication bus number",
      };
    }

    const busClassEnumValue: BusClass =
      BusClass[formData.busClass as keyof typeof BusClass];

    let bus;
    if (
      session.role === RolesEnum.SuperAdmin &&
      formData.busOperator !== undefined
    ) {
      bus = await db.busses.update({
        where: {
          id: id,
        },
        data: {
          name: formData.name,
          operatorId: formData.busOperator,
          busID: formData.iden,
          registration: formData.regNumber,
          capacity: formData.capacity,
          busClass: busClassEnumValue,
          homeBase: formData.location,
          driverName: formData.driver,
          comments: formData.comments,
        },
      });
    } else if (session.role === RolesEnum.BusCompanyAdmin) {
      bus = await db.busses.update({
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
    }

    if (!bus) {
      return null;
    }
    revalidatePath("/app/fleet");
    return "success";
  } catch (error) {
    console.error("Error creating bus:", error);
    return null;
  }
}

export async function updateBusStatus(
  id: string,
  status: boolean
): Promise<true | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const Busses = await db.busses.update({
      where: {
        id: id,
      },
      data: {
        isLive: status,
      },
    });
    if (!Busses) {
      return null;
    }

    revalidatePath("/app/fleet");
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}
