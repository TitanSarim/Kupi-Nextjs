"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  convertToTicketSources,
  FilterProps,
  PassengerDetails,
  SortOrderProps,
  TicketsActionReturn,
  TicketsDataType,
} from "@/types/ticket";
import { RolesEnum } from "@/types/auth";

export async function getAllTickets(searchParams: {
  operator?: string;
  source?: string;
  destinationCity?: string;
  arrivalCity?: string;
  onlyPending?: boolean;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<TicketsActionReturn | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      operator,
      source,
      destinationCity,
      arrivalCity,
      onlyPending,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const filter: FilterProps = {};
    if (operator) filter.operatorId = operator;
    if (source) filter.source = convertToTicketSources(source);
    if (destinationCity)
      filter.sourceCity = {
        name: { contains: destinationCity, mode: "insensitive" },
      };
    if (arrivalCity)
      filter.arrivalCity = {
        name: { contains: arrivalCity, mode: "insensitive" },
      };
    if (onlyPending !== undefined) filter.status = "RESERVED";

    const sortOrder: SortOrderProps[] = [];
    if (sort) {
      const [field, order] = sort.split("_");

      if (field === "totalPrice") {
        sortOrder.push({
          priceDetails: { totalPrice: order === "asc" ? "asc" : "desc" },
        });
      }

      if (field === "sourceCity") {
        sortOrder.push({
          sourceCity: { name: order === "asc" ? "asc" : "desc" },
        });
      }

      if (field === "CustomerName") {
        sortOrder.push({
          customer: { name: order === "asc" ? "asc" : "desc" },
        });
      }

      if (
        field === "busIdentifier" ||
        field === "ticketId" ||
        field === "source" ||
        field === "status" ||
        field === "reservedAt"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ reservedAt: "desc" });
    }

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    let ticketData;
    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      ticketData = await db.tickets.findMany({
        where: filter,
        orderBy: sortOrder.length > 0 ? sortOrder : undefined,
        skip,
        take,
        include: {
          customer: true,
          transaction: true,
          bus: true,
          sourceCity: true,
          arrivalCity: true,
        },
      });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      ticketData = await db.tickets.findMany({
        where: { ...filter, operatorId: session.operatorId },
        orderBy: sortOrder.length > 0 ? sortOrder : undefined,
        skip,
        take,
        include: {
          customer: true,
          transaction: true,
          bus: true,
          sourceCity: true,
          arrivalCity: true,
        },
      });
    }

    if (!ticketData) {
      return null;
    }

    const wrappedTickets: TicketsDataType[] = ticketData.map((ticket) => ({
      tickets: ticket,
      customer: ticket.customer || null,
      bus: ticket.bus || null,
      transaction: ticket.transaction || null,
      sourceCity: ticket.sourceCity,
      arrivalCity: ticket.arrivalCity,
      passengerDetails: Array.isArray(ticket.passengerDetails)
        ? (ticket.passengerDetails as PassengerDetails[])
        : ticket.passengerDetails && typeof ticket.passengerDetails === "object"
        ? [ticket.passengerDetails as PassengerDetails]
        : null,
    }));

    let totalCount;
    if (
      session.role === RolesEnum.SuperAdmin ||
      session.role === RolesEnum.KupiUser
    ) {
      totalCount = await db.tickets.count({ where: filter });
    } else if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      totalCount = await db.tickets.count({
        where: { ...filter, operatorId: session.operatorId },
      });
    }

    if (!totalCount) {
      return null;
    }

    return {
      ticketData: wrappedTickets,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error("Error getting tickets:", error);
    return null;
  }
}

export async function getTicketById(
  ticketId: string
): Promise<TicketsDataType | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const ticket = await db.tickets.findFirst({
      where: {
        ticketId: ticketId,
      },
      include: {
        customer: true,
        transaction: true,
        bus: true,
        sourceCity: true,
        arrivalCity: true,
      },
    });

    if (!ticket) {
      return null;
    }

    const passengerDetails: PassengerDetails[] | null = Array.isArray(
      ticket.passengerDetails
    )
      ? (ticket.passengerDetails as PassengerDetails[])
      : ticket.passengerDetails && typeof ticket.passengerDetails === "object"
      ? [ticket.passengerDetails as PassengerDetails]
      : null;

    const ticketData: TicketsDataType = {
      tickets: ticket,
      bus: ticket.bus,
      customer: ticket.customer,
      transaction: ticket.transaction,
      sourceCity: ticket.sourceCity,
      arrivalCity: ticket.arrivalCity,
      passengerDetails: passengerDetails,
    };

    return ticketData;
  } catch (error) {
    console.error("Error getting ticket:", error);
    return null;
  }
}
