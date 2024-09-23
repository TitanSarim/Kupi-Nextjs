import { getAllDiscount } from "@/actions/discount.actions";
import { getAllMatchedCity, getAllOperators } from "@/actions/search.action";
import { auth } from "@/auth";
import DiscountList from "@/components/discount/DiscountList";
import Loading from "@/components/Loading";
import NavBar from "@/components/NavBar";
import SideBar from "@/components/SideBar";
import { DiscountQuery } from "@/types/discount";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

const Discounts = async ({
  searchParams,
}: {
  searchParams: DiscountQuery["searchParams"];
}) => {
  const cities = await getAllMatchedCity();
  const operators = await getAllOperators();
  const discounts = await getAllDiscount(searchParams);
  if (!cities) {
    return null;
  }
  if (!operators) {
    return null;
  }
  if (!discounts) {
    return null;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <DiscountList
          cities={cities}
          operators={operators}
          discounts={discounts.discounts}
          paginationData={discounts.paginationData}
        />
      </div>
    </div>
  );
};

export default Discounts;
