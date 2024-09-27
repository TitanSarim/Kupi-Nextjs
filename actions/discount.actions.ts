"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  DiscountActionReturn,
  discountDataType,
  DiscountFormData,
  FilterProps,
  TicketSources,
} from "@/types/discount";
import { Discounts } from "@prisma/client";
import { SortOrderProps } from "@/types/ticket";
import { revalidatePath } from "next/cache";

export async function createDiscount(
  formData: DiscountFormData
): Promise<Discounts | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const sourceEnumValues: TicketSources[] = formData.source.map(
      (s: string) => {
        if (s in TicketSources) {
          return TicketSources[s as keyof typeof TicketSources];
        }
        throw new Error(`Invalid source: ${s}`);
      }
    );

    const discount = await db.discounts.create({
      data: {
        name: formData.discountname,
        operatorIds:
          formData.selectedOperators.length > 0
            ? formData.selectedOperators
            : [],
        departureCityId: formData.destinationCityId || null,
        arrivalCityId: formData.arrivalCityId || null,
        percentage: Number(formData.percentage),
        source: sourceEnumValues.length > 0 ? sourceEnumValues : [],
        maxUseCount: Number(formData.count) || null,
        expiryDate: new Date(formData.date),
        isDeleted: false,
      },
    });
    revalidatePath("/app/discounts");
    return discount || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateDiscount(
  formData: DiscountFormData,
  discountId: string
): Promise<Discounts | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const sourceEnumValues: TicketSources[] = formData.source.map(
      (s: string) => {
        if (s in TicketSources) {
          return TicketSources[s as keyof typeof TicketSources];
        }
        throw new Error(`Invalid source: ${s}`);
      }
    );

    const discount = await db.discounts.update({
      where: {
        id: discountId,
      },
      data: {
        name: formData.discountname,
        operatorIds:
          formData.selectedOperators.length > 0
            ? formData.selectedOperators
            : [],
        departureCityId: formData.destinationCityId || null,
        arrivalCityId: formData.arrivalCityId || null,
        percentage: Number(formData.percentage),
        source: sourceEnumValues.length > 0 ? sourceEnumValues : [],
        maxUseCount: Number(formData.count) || null,
        expiryDate: new Date(formData.date),
        isDeleted: false,
      },
    });
    revalidatePath("/app/discounts");
    return discount || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAllDiscount(searchParams: {
  name?: string;
  onlyExpiring?: boolean;
  busOperator?: string;
  destinationCity?: string;
  arrivalCity?: string;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<DiscountActionReturn | null> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return null;
    }

    const {
      name,
      onlyExpiring,
      sort,
      busOperator,
      destinationCity,
      arrivalCity,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const filter: FilterProps = {};
    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }
    if (destinationCity)
      filter.departureCity = {
        name: { contains: destinationCity, mode: "insensitive" },
      };
    if (arrivalCity)
      filter.arrivalCity = {
        name: { contains: arrivalCity, mode: "insensitive" },
      };

    if (onlyExpiring) {
      const currentDate = new Date();
      filter.expiryDate = { lt: currentDate };
    }

    const sortOrder: SortOrderProps[] = [];
    if (sort) {
      const [field, order] = sort.split("_");

      if (field === "totalPrice") {
        sortOrder.push({
          priceDetails: { totalPrice: order === "asc" ? "asc" : "desc" },
        });
      }

      if (field === "departure") {
        sortOrder.push({
          arrivalCity: { name: order === "asc" ? "asc" : "desc" },
        });
      }
      if (
        field === "name" ||
        field === "percentage" ||
        field === "expiryDate"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ createdAt: "desc" });
    }

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const discounts = await db.discounts.findMany({
      where: filter,
      orderBy: sortOrder,
      skip,
      take,
      include: {
        departureCity: true,
        arrivalCity: true,
      },
    });

    if (!discounts) {
      return null;
    }

    const totalCount = await db.discounts.count();

    const wrappedDiscounts: discountDataType[] = discounts.map((discount) => ({
      discount: discount,
      arrivalCity: discount.arrivalCity,
      sourceCity: discount.departureCity,
    }));

    return {
      discounts: wrappedDiscounts,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
