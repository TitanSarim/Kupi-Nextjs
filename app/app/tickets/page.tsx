import { getAllTickets } from "@/actions/ticket.action";
import TicketList from "@/components/tickets/TicketList";
import React, { Suspense } from "react";
import { TicketQuery } from "@/types/ticket";
import { getAllMatchedCity } from "@/actions/search.action";

const Tickets = async ({
  searchParams,
}: {
  searchParams: TicketQuery["searchParams"];
}) => {
  const data = await getAllTickets(searchParams);
  const cities = await getAllMatchedCity();
  if (!data || !cities) {
    return (
      <div className="bg-page-backgound flex items-start justify-center h-screen w-full">
        <div className="mt-32">
          <p>No Data Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <TicketList
          ticketData={data?.ticketData}
          cities={cities}
          paginationData={data.paginationData}
        />
      </div>
    </div>
  );
};

export default Tickets;
