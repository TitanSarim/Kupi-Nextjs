"use client";
import React, { useState, useEffect, startTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import AddLocation from "@/components/route/AddLocation";
import {
  Cities,
  Location,
  Busses,
  DAYS,
  RouteType,
  Countries,
} from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createRoute } from "@/actions/route.action";
import { getAllBuses } from "@/actions/bus.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";

import {
  validateRouteType,
  validateRouteDays,
  validateBusSelection,
  validateLocationsAndTimes,
  validateTicketPrices,
  validateStops,
} from "@/libs/ClientSideHelpers";
import { count } from "console";

interface AddRouteProps {
  cities: Cities[];
  countries: { name: string; id: string }[] | null;
}

const AddRoute: React.FC<AddRouteProps> = ({ cities, countries }) => {
  const [stops, setStops] = useState<
    { location: Location; arrivalTime: string; departureTime: string }[]
  >([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<
    string | number | null
  >(null);
  const [departureLocation, setDepartureLocation] = useState<Location | null>(
    null
  );
  const [arrivalLocation, setArrivalLocation] = useState<Location | null>(null);
  const [routeDays, setRouteDays] = useState<DAYS[]>([]);
  const [routeNumber, setRouteNumber] = useState<string>("");
  const [departureTime, setDepartureTime] = useState<string>("00:00");
  const [arrivalTime, setArrivalTime] = useState<string>("00:00");
  const [prices, setPrices] = useState<
    { fromIndex: number; toIndex: number; price: number | null }[]
  >([]);
  const [routeType, setRouteType] = useState<RouteType>("DAILY");

  const daysEnum = Object.values(DAYS) as DAYS[];

  const [buses, setBuses] = useState<Busses[]>([]);
  const [selectedBus, setSelectedBus] = useState<Busses | null>(null);
  const [busSearch, setBusSearch] = useState("");
  const [openBusPopover, setOpenBusPopover] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //Router
  const router = useRouter();

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const busesData = await getAllBuses();
        setBuses(busesData);
      } catch (error) {}
    };

    fetchBuses();
  }, []);

  // Add a new stop to the schedule
  const addStop = () => {
    setSelectedLocationType(stops.length);
    setShowAddLocationModal(true);
  };

  const toggleRouteDay = (day: DAYS) => {
    if (routeDays.includes(day)) {
      setRouteDays(routeDays.filter((d) => d !== day));
    } else {
      setRouteDays([...routeDays, day]);
    }
  };

  const openAddLocationModal = (type: string | number) => {
    setSelectedLocationType(type);
    setShowAddLocationModal(true);
  };

  const closeAddLocationModal = () => {
    setShowAddLocationModal(false);
  };

  const handleAddLocation = (location: Location) => {
    if (selectedLocationType === "departure") {
      setDepartureLocation(location);
    } else if (selectedLocationType === "arrival") {
      setArrivalLocation(location);
    } else if (typeof selectedLocationType === "number") {
      const newStop = {
        location,
        arrivalTime: "",
        departureTime: "",
      };
      setStops([...stops, newStop]);
    }
    closeAddLocationModal();
  };

  // Handle changes to stop fields
  type StopFieldType = "arrivalTime" | "departureTime" | "location";

  const handleStopChange = (
    index: number,
    field: StopFieldType,
    value: string | Location
  ) => {
    const newStops = [...stops];
    newStops[index][field] = value as any;
    setStops(newStops);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate Route Type
    if (!validateRouteType(routeType)) {
      newErrors.routeType = "Please select at least one route type.";
    }

    // Validate Route Days for Weekly route
    if (!validateRouteDays(routeType, routeDays)) {
      newErrors.routeDays =
        "Please select at least one route day for a weekly route.";
    }

    // Validate that a bus is selected
    if (!validateBusSelection(selectedBus)) {
      newErrors.selectedBus = "Please select a bus for the route.";
    }

    // Validate Departure/Arrival Locations and Times
    if (
      !validateLocationsAndTimes(
        departureLocation,
        arrivalLocation,
        departureTime,
        arrivalTime
      )
    ) {
      newErrors.locations =
        "Please provide valid departure and arrival locations with times.";
    }

    // Validate Ticket Pricing
    if (!validateTicketPrices(prices, stops.length)) {
      newErrors.ticketPrices = "Please provide ticket prices for all segments.";
    }

    // Validate Stop Times if stops are added
    if (stops.length > 0 && !validateStops(stops)) {
      newErrors.stops = "Please provide valid times for all stops.";
    }

    // Set the errors if any exist, else proceed with the API call
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed with creating the route
    try {
      const formattedStops = stops.map((stop, index) => ({
        location: stop.location,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        priceUSD:
          prices
            .filter((price) => price.fromIndex === index)
            .map((p) => p.price || 0)[0] || 0,
        priceLocal: null,
      }));

      const pricingData = {
        amountUSD:
          prices.find(
            (price) => price.fromIndex === -1 && price.toIndex === stops.length
          )?.price || 0,
        pricingData: prices,
        departureLocation,
        arrivalLocation,
      };

      const routeData = {
        type: routeType,
        days: routeDays,
        status: "PENDING",
        routeNumber,
        departureLocation,
        arrivalLocation,
        departureTime,
        arrivalTime,
        stops: formattedStops,
        pricing: pricingData,
        busId: selectedBus ? selectedBus.busID : null,
        departureCity: departureLocation?.cityId
          ? cities.find((city) => city.id === departureLocation.cityId)?.name ||
            ""
          : "",
        arrivalCity: arrivalLocation?.cityId
          ? cities.find((city) => city.id === arrivalLocation.cityId)?.name ||
            ""
          : "",
      };

      const result = await createRoute(routeData);
      if (result) {
        startTransition(() => {
          router.refresh(); // Ensures the table re-renders with updated data
        });
        router.push("/app/routes");
      }
    } catch (error) {}
  };

  return (
    <div className="p-8 sm:mt-5 grid grid-cols-1 gap-5 lg:grid-cols-1">
      {/* Route Type, Route Number, and Route Days */}
      <div className="card border-0 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-dark-grey">Add New Route</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            {/* Route Type */}
            <div className="w-full">
              <label
                htmlFor="route-type"
                className="flex text-md font-medium leading-6 text-dark-grey items-center gap-2"
              >
                Route Type
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Select either Daily or Weekly for this route.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="flex flex-wrap mt-4">
                <div className="px-4 py-2 bg-gray-100 border-gray-300 border rounded-lg mr-4">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="daily"
                      name="route-type"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-dark-grey focus:ring-indigo-600"
                      checked={routeType === "DAILY"}
                      onChange={() => setRouteType("DAILY")}
                    />
                    <label
                      htmlFor="daily"
                      className="block text-sm font-medium leading-6 text-gray-900 pl-3"
                    >
                      Daily
                    </label>
                  </div>
                </div>
                <div className="px-4 py-2 bg-gray-100 border-gray-300 border rounded-lg">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="weekly"
                      name="route-type"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-dark-grey focus:ring-indigo-600"
                      checked={routeType === "WEEKLY"}
                      onChange={() => setRouteType("WEEKLY")}
                    />
                    <label
                      htmlFor="weekly"
                      className="block text-sm font-medium leading-6 text-gray-900 pl-3"
                    >
                      Weekly
                    </label>
                  </div>
                </div>
              </div>
              <ErrorMessage message={errors.routeType} />
            </div>

            {/* Route Number */}
            <div className="w-full">
              <label
                htmlFor="route-number"
                className="flex text-md font-medium leading-6 text-dark-grey gap-2"
              >
                Route Number
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      This number is auto-generated and unique for each route.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="mt-2">
                <Input
                  type="text"
                  name="route-number"
                  id="route-number"
                  placeholder="AutoGenerated Unique Number"
                  className="h-12 border-gray-400 rounded-lg"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Route Days */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1 mt-6">
            <div className="w-full">
              <label
                htmlFor="route-days"
                className="flex text-md font-medium leading-6 text-dark-grey items-center gap-2"
              >
                Select Route Days
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Choose the days when the route will operate.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="flex flex-wrap mt-2">
                {daysEnum.map((day) => (
                  <div
                    key={day}
                    onClick={() => toggleRouteDay(day)}
                    className={`px-3 py-2 border rounded-lg text-sm mt-2 mr-2 cursor-pointer ${
                      routeDays.includes(day as DAYS)
                        ? "bg-kupi-yellow text-dark-grey border-kupi-yellow"
                        : "border-gray-500 text-might-blue hover:bg-kupi-yellow hover:text-dark-grey hover:border-kupi-yellow"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              <ErrorMessage message={errors.routeDays} />
            </div>

            {/* Route Bus */}
            <div className="w-full">
              <label
                htmlFor="route-bus"
                className="text-md font-medium leading-6 text-dark-grey flex items-center gap-2"
              >
                Add Route Bus
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Select a bus that will be assigned to this route.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="mt-2">
                <Popover open={openBusPopover} onOpenChange={setOpenBusPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBusPopover}
                      className="w-full justify-between outline-none"
                    >
                      {selectedBus ? selectedBus.busID : "Select bus..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 select-dropdown">
                    <Command>
                      <CommandInput
                        placeholder="Search bus..."
                        value={busSearch}
                        onValueChange={setBusSearch}
                      />
                      <CommandList className="w-full">
                        <CommandEmpty>No bus found.</CommandEmpty>
                        <CommandGroup>
                          {buses
                            .filter((bus) =>
                              bus.busID
                                .toLowerCase()
                                .includes(busSearch.toLowerCase())
                            )
                            .map((bus) => (
                              <CommandItem
                                key={bus.id}
                                value={bus.busID}
                                onSelect={() => {
                                  setSelectedBus(bus);
                                  setOpenBusPopover(false);
                                }}
                                className="cursor-pointer w-full"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedBus && bus.id === selectedBus.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {bus.busID}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <ErrorMessage message={errors.selectedBus} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Time and Location */}
      <div className="card border-0 shadow-lg mt-5">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-dark-grey">
              Add Time and Location
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            {/* Add Departure Location */}
            <div className="w-full">
              <label
                htmlFor="departure-location"
                className="text-md font-medium leading-6 text-dark-grey flex items-center gap-2"
              >
                Add Departure Location
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Select the location where the route will start.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div
                className="block mt-2 px-5 py-2 border border-gray-500 w-full rounded-lg cursor-pointer"
                onClick={() => openAddLocationModal("departure")}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-500">
                    {departureLocation
                      ? `${departureLocation.stationName}, ${
                          cities.find(
                            (city) => city.id === departureLocation.cityId
                          )?.name || ""
                        }`
                      : "Click to add location"}
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black text-white"
                  >
                    Add Location
                  </Button>
                </div>
              </div>
            </div>

            {/* Select Departure Time */}
            <div className="w-full">
              <label
                htmlFor="departure-time"
                className="text-md font-medium leading-6 inline-flex text-dark-grey items-center gap-2"
              >
                Select Departure Time
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Set the time when the route will start from the departure
                      location.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="mt-2">
                <Input
                  type="time"
                  id="departure-time"
                  className="h-12 border-gray-400 rounded-lg"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add Arrival Location */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1 mt-5">
            {/* Add Arrival Location */}
            <div className="w-full">
              <label
                htmlFor="arrival-location"
                className="text-md font-medium leading-6 text-dark-grey flex items-center gap-2"
              >
                Add Arrival Location
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Select the final destination for the route.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div
                className="block mt-2 px-5 py-2 border border-gray-500 w-full rounded-lg cursor-pointer"
                onClick={() => openAddLocationModal("arrival")}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-500">
                    {arrivalLocation
                      ? `${arrivalLocation.stationName}, ${
                          cities.find(
                            (city) => city.id === arrivalLocation.cityId
                          )?.name || ""
                        }`
                      : "Click to add location"}
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black text-white"
                  >
                    Add Location
                  </Button>
                </div>
              </div>
              <ErrorMessage message={errors.locations} />
            </div>

            {/* Select Arrival Time */}
            <div className="w-full">
              <label
                htmlFor="arrival-time"
                className="text-md font-medium leading-6 text-dark-grey flex items-center gap-2"
              >
                Select Arrival Time
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src="/img/settings/question-icon.svg"
                        alt="tooltip"
                        width={20}
                        height={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border-2 px-2 py-2">
                      Set the time when the route will reach the final
                      destination.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="mt-2">
                <Input
                  type="time"
                  id="arrival-time"
                  className="h-12 border-gray-400 rounded-lg"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Schedule */}
      <div className="card border-0 shadow-lg mt-5">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-dark-grey">Stop Schedule</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={addStop}
              className="bg-kupi-yellow text-dark-grey"
            >
              Add Stop
            </Button>
          </div>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Departure Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stops.map((stop, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <h4 className="text-gray-500">
                        {stop.location.stationName
                          ? `${stop.location.stationName}, ${
                              cities.find(
                                (city) => city.id === stop.location.cityId
                              )?.name || ""
                            }`
                          : "Location not set"}
                      </h4>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="time"
                        value={stop.arrivalTime}
                        onChange={(e) =>
                          handleStopChange(index, "arrivalTime", e.target.value)
                        }
                        className="border-gray-400 rounded-lg"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={stop.departureTime}
                        onChange={(e) =>
                          handleStopChange(
                            index,
                            "departureTime",
                            e.target.value
                          )
                        }
                        className="border-gray-400 rounded-lg"
                      />
                    </TableCell>

                    {/* Tooltip */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Image
                              src="/img/settings/question-icon.svg"
                              alt="tooltip"
                              width={20}
                              height={20}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white border-2 px-2 py-2">
                            Add additional details about the stop here.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="cursor-pointer">
                            <Image
                              src="/img/icons/actions.svg"
                              alt="icon"
                              height={4.5}
                              width={4.5}
                            />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              setStops(stops.filter((_, i) => i !== index))
                            }
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ErrorMessage message={errors.stops} />
        </div>
      </div>

      {/* Ticket Pricing */}
      <div className="card border-0 shadow-lg mt-5">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-dark-grey">Ticket Pricing</h2>
          </div>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From/To</TableHead>
                  {/* Generate Headers for Stops and Arrival Point */}
                  {stops.map((stop, i) => (
                    <TableHead key={i}>
                      {stop.location.stationName || `Stop ${i + 1}`}
                    </TableHead>
                  ))}
                  {/* Include Arrival Point */}
                  <TableHead>
                    {arrivalLocation?.stationName || "Arrival Point"}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Departure Point Row */}
                <TableRow>
                  <TableCell>
                    {departureLocation?.stationName || "Departure Point"}
                  </TableCell>
                  {/* Prices from Departure Point to Stops and Arrival Point */}
                  {stops.map((_, index) => (
                    <TableCell key={`dp-${index}`}>
                      <div className="currency-input">
                        <Input
                          type="number"
                          placeholder="$0.00"
                          className="border-gray-400 rounded-lg text-center"
                          value={
                            prices.find(
                              (price) =>
                                price.fromIndex === -1 &&
                                price.toIndex === index
                            )?.price || ""
                          }
                          onChange={(e) => {
                            const priceValue =
                              e.target.value !== "" &&
                              !isNaN(parseFloat(e.target.value))
                                ? Math.max(0, parseFloat(e.target.value)) // Prevent negative values
                                : null;

                            setPrices((prevPrices) => {
                              const updatedPrices = prevPrices.filter(
                                (price) =>
                                  !(
                                    price.fromIndex === -1 &&
                                    price.toIndex === index
                                  )
                              );
                              updatedPrices.push({
                                fromIndex: -1,
                                toIndex: index,
                                price: priceValue,
                              });
                              return updatedPrices;
                            });
                          }}
                        />
                      </div>
                    </TableCell>
                  ))}
                  {/* Price from Departure Point to Arrival Point */}
                  <TableCell key="dp-arrival">
                    <div className="currency-input">
                      <Input
                        type="number"
                        placeholder="$0.00"
                        className="border-gray-400 rounded-lg text-center"
                        value={
                          prices.find(
                            (price) =>
                              price.fromIndex === -1 &&
                              price.toIndex === stops.length
                          )?.price || ""
                        }
                        onChange={(e) => {
                          const priceValue =
                            e.target.value !== "" &&
                            !isNaN(parseFloat(e.target.value))
                              ? Math.max(0, parseFloat(e.target.value)) // Prevent negative values
                              : null;
                          setPrices((prevPrices) => {
                            const updatedPrices = prevPrices.filter(
                              (price) =>
                                !(
                                  price.fromIndex === -1 &&
                                  price.toIndex === stops.length
                                )
                            );
                            updatedPrices.push({
                              fromIndex: -1, // -1 represents Departure Point
                              toIndex: stops.length, // Arrival Point index
                              price: priceValue,
                            });
                            return updatedPrices;
                          });
                        }}
                      />
                    </div>
                  </TableCell>

                  {/* Tooltip */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Image
                            src="/img/settings/question-icon.svg"
                            alt="tooltip"
                            width={20}
                            height={20}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-2 px-2 py-2">
                          Add additional details about ticket pricing here.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>

                {/* Stops Rows */}
                {stops.map((stop, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    <TableCell>
                      {stop.location.stationName || `Stop ${rowIndex + 1}`}
                    </TableCell>

                    {/* Render empty cells for previous stops */}
                    {Array.from({ length: rowIndex + 1 }, (_, i) => (
                      <TableCell key={`empty-${i}`}></TableCell>
                    ))}

                    {/* Prices from this Stop to subsequent Stops */}
                    {stops.slice(rowIndex + 1).map((_, colIndex) => (
                      <TableCell
                        key={`s${rowIndex}-s${rowIndex + colIndex + 1}`}
                      >
                        <div className="currency-input">
                          <Input
                            type="number"
                            placeholder="$0.00"
                            className="border-gray-400 rounded-lg text-center"
                            value={
                              prices.find(
                                (price) =>
                                  price.fromIndex === rowIndex &&
                                  price.toIndex === rowIndex + colIndex + 1
                              )?.price || ""
                            }
                            onChange={(e) => {
                              const priceValue =
                                e.target.value !== "" &&
                                !isNaN(parseFloat(e.target.value))
                                  ? Math.max(0, parseFloat(e.target.value)) // Prevent negative values
                                  : null;
                              setPrices((prevPrices) => {
                                const updatedPrices = prevPrices.filter(
                                  (price) =>
                                    !(
                                      price.fromIndex === rowIndex &&
                                      price.toIndex === rowIndex + colIndex + 1
                                    )
                                );
                                updatedPrices.push({
                                  fromIndex: rowIndex,
                                  toIndex: rowIndex + colIndex + 1,
                                  price: priceValue,
                                });
                                return updatedPrices;
                              });
                            }}
                          />
                        </div>
                      </TableCell>
                    ))}

                    {/* Price from this Stop to Arrival Point */}
                    <TableCell key={`s${rowIndex}-arrival`}>
                      <div className="currency-input">
                        <Input
                          type="number"
                          placeholder="$0.00"
                          className="border-gray-400 rounded-lg text-center"
                          value={
                            prices.find(
                              (price) =>
                                price.fromIndex === rowIndex &&
                                price.toIndex === stops.length
                            )?.price || ""
                          }
                          onChange={(e) => {
                            const priceValue =
                              e.target.value !== "" &&
                              !isNaN(parseFloat(e.target.value))
                                ? Math.max(0, parseFloat(e.target.value)) // Prevent negative values
                                : null;
                            setPrices((prevPrices) => {
                              const updatedPrices = prevPrices.filter(
                                (price) =>
                                  !(
                                    price.fromIndex === rowIndex &&
                                    price.toIndex === stops.length
                                  )
                              );
                              updatedPrices.push({
                                fromIndex: rowIndex,
                                toIndex: stops.length, // Arrival Point index
                                price: priceValue,
                              });
                              return updatedPrices;
                            });
                          }}
                        />
                      </div>
                    </TableCell>

                    {/* Tooltip */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Image
                              src="/img/settings/question-icon.svg"
                              alt="tooltip"
                              width={20}
                              height={20}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white border-2 px-2 py-2">
                            Add additional details about ticket pricing here.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ErrorMessage message={errors.ticketPrices} />
        </div>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end mt-5">
        <Button
          variant="secondary"
          className="bg-dim-grey text-dark-grey mr-2"
          onClick={() => {
            router.push("/app/routes");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className="bg-kupi-yellow text-dark-grey"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>

      {/* AddLocation Modal */}
      <AddLocation
        open={showAddLocationModal}
        onClose={closeAddLocationModal}
        cities={cities}
        countries={countries || []}
        onAddLocation={handleAddLocation}
      />
    </div>
  );
};
export default AddRoute;
