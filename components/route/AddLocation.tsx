"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { Cities, Countries } from "@prisma/client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./GoogleMap"), { ssr: false });

interface AddLocationProps {
  open: boolean;
  onClose: () => void;
  cities: Cities[];
  countries: { name: string; id: string }[];
  onAddLocation?: (location: LocationType) => void; // Callback to send location data back
}

interface LocationType {
  stationName: string;
  streetAddress: string;
  suburb: string;
  cityId: string;
  countryId: string;
  geoLocation: string;
}

const AddLocation: React.FC<AddLocationProps> = ({
  open,
  onClose,
  cities = [],
  countries = [],
  onAddLocation,
}) => {
  const [stationName, setStationName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [country, setCountry] = useState("");
  const [countryId, setCountryId] = useState("");
  const [geolocation, setGeolocation] = useState({ lat: 0, lng: 0 });
  const [openCity, setOpenCity] = useState(false);
  const [openCountry, setOpenCountry] = useState(false); // State for country popover
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<[string, boolean]>(["", false]);
  const [filteredCities, setFilteredCities] = useState<Cities[]>(cities);
  const [filteredCountries, setFilteredCountries] = useState(countries);

  useEffect(() => {
    if (!openCity && city) {
      setFilteredCities(
        cities.filter((c) => c.name.toLowerCase().includes(city.toLowerCase()))
      );
    } else {
      setFilteredCities(cities);
    }
  }, [openCity, city, cities]);

  useEffect(() => {
    if (!openCountry && country) {
      setFilteredCountries(
        countries.filter((c) =>
          c.name.toLowerCase().includes(country.toLowerCase())
        )
      );
    } else {
      setFilteredCountries(countries);
    }
  }, [openCountry, country, countries]);

  useEffect(() => {
    if (open) {
      setStationName("");
      setStreetAddress("");
      setSuburb("");
      setCity("");
      setCityId("");
      setCountry("");
      setCountryId("");
      setGeolocation({ lat: 0, lng: 0 });
      setOpenCity(false);
      setOpenCountry(false); // Reset country state
      setLoading(false);
      setErrorState(["", false]);
      setFilteredCities(cities);
      setFilteredCountries(countries);
    }
  }, [open, cities, countries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !stationName ||
      !streetAddress ||
      !suburb ||
      !city ||
      !country ||
      geolocation.lat === 0
    ) {
      setErrorState(["", true]);
      return;
    }

    const locationData: LocationType = {
      stationName,
      streetAddress,
      suburb,
      cityId,
      countryId,
      geoLocation: `${geolocation.lat},${geolocation.lng}`,
    };

    setLoading(true);
    try {
      if (onAddLocation) {
        onAddLocation(locationData);
      }
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error adding location:", error);
      setLoading(false);
    }
  };

  const handleCityChange = (selectedCity: Cities) => {
    setCity(selectedCity.name);
    setCityId(selectedCity.id);
    setCountryId(selectedCity.countryId);
    setOpenCity(false);
  };

  const handleCountryChange = (selectedCountry: Countries) => {
    setCountry(selectedCountry.name);
    setCountryId(selectedCountry.id);
    setOpenCountry(false);
  };

  const handleGeolocationSelect = (coords: { lat: number; lng: number }) => {
    setGeolocation(coords);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 dialguebox-container ">
      <div className="bg-dim-grey py-6 px-8 rounded-lg shadow-lg w-full max-w-lg h-[80vh] overflow-y-auto dialguebox">
        {/* Modal Header */}
        <div className="w-full flex flex-row justify-between">
          <h2 className="text-dark-grey text-xl font-semibold">Add Location</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <Image
              src="/img/icons/Close-Icon.svg"
              alt="Close"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0">
          {/* Station Name Field */}
          <div className="w-full mb-3">
            <label
              htmlFor="station-name"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Station Name
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="station-name"
                id="station-name"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Enter station"
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
                maxLength={25}
              />
            </div>
            {errorState[1] && !stationName && (
              <p className="text-red-500">Station Name is required.</p>
            )}
          </div>

          {/* Street Address Field */}
          <div className="w-full mb-3">
            <label
              htmlFor="street-address"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Street Address
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="street-address"
                id="street-address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Enter street address"
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
                maxLength={60}
              />
            </div>
            {errorState[1] && !streetAddress && (
              <p className="text-red-500">Street Address is required.</p>
            )}
          </div>

          {/* Suburb Field */}
          <div className="w-full mb-3">
            <label
              htmlFor="suburb"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Suburb
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="suburb"
                id="suburb"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Enter suburb"
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
                maxLength={20}
              />
            </div>
            {errorState[1] && !suburb && (
              <p className="text-red-500">Suburb is required.</p>
            )}
          </div>

          {/* City Selection */}
          <div className="w-full mb-3">
            <label
              htmlFor="city"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              City
            </label>
            <Popover open={openCity} onOpenChange={setOpenCity}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-500"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCity}
                  className="w-full justify-between outline-none"
                >
                  {city || "Select city..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 select-dropdown">
                <Command>
                  <CommandInput
                    placeholder="Search city..."
                    value={city}
                    onValueChange={(value) => setCity(value)}
                  />
                  <CommandList className="w-full">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCities.map((cityData) => (
                        <CommandItem
                          key={cityData.id}
                          value={cityData.name}
                          onSelect={() => handleCityChange(cityData)}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              cityData.name === city
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {cityData.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errorState[1] && !city && (
              <p className="text-red-500">City is required.</p>
            )}
          </div>

          {/* Country Selection */}
          <div className="w-full mb-3">
            <label
              htmlFor="country"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Country
            </label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger
                asChild
                className="w-full h-12 rounded-lg text-gray-500 border-gray-500"
              >
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className="w-full justify-between outline-none"
                >
                  {country || "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 select-dropdown">
                <Command>
                  <CommandInput
                    placeholder="Search country..."
                    value={country}
                    onValueChange={(value) => setCountry(value)}
                  />
                  <CommandList className="w-full">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCountries.map((countryData) => (
                        <CommandItem
                          key={countryData.id}
                          value={countryData.name}
                          onSelect={() => handleCountryChange(countryData)}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              countryData.name === country
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {countryData.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errorState[1] && !country && (
              <p className="text-red-500">Country is required.</p>
            )}
          </div>

          {/* Map Selection */}
          <div className="w-full mb-3">
            <label className="block text-md font-medium leading-6 text-dark-grey">
              Select Location on Map
            </label>
            <div className="w-full h-64 mt-2 rounded-lg border border-gray-500">
              <Map
                googleMapsApiKey={
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
                }
                onLocationSelect={handleGeolocationSelect}
              />
            </div>
            {geolocation.lat === 0 && geolocation.lng === 0 && (
              <p className="text-red-500">
                Please select a location on the map.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-5">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-dim-grey text-dark-grey"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              type="submit"
              className="bg-kupi-yellow text-dark-grey"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;
