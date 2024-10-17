import { Area } from "react-easy-crop";
import { Observable } from "rxjs";

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
//generate 5 digit random number function called generateRouteNumber
export const generateRouteNumber = () => {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a 5-digit code
};
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Validate email and enforce lowercase and valid domain
export const validateEmail = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(lowerEmail);
};

// Ensure only alphabetical characters and spaces
export const isAlphabetic = (value: string): boolean => {
  return /^[A-Za-z\s]*$/.test(value); // Allow spaces
};

// Validate WhatsApp number format
export const validateWhatsAppNumber = (number: string): boolean => {
  const numberRegex = /^\+?[0-9]{9,15}$/;
  return numberRegex.test(number);
};

// Ensure password complexity
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/; // Enforce minimum length of 8
  return passwordRegex.test(password);
};

export const validateFields = (name: string, value: string): string => {
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  if (name === "name" || name === "surname") {
    if (!maxLength(value, 20)) {
      return `${capitalize(name)} should not exceed 20 characters.`;
    } else if (!isAlphabetic(value)) {
      return `${capitalize(name)} should only contain alphabetic characters.`;
    } else if (!value.trim()) {
      return `${capitalize(name)} cannot be empty.`;
    }
  } else if (name === "email" && !validateEmail(value)) {
    return "Please enter a valid email address.";
  } else if (name === "number" && !validateWhatsAppNumber(value)) {
    return "Please enter a valid WhatsApp number.";
  } else if (name === "password" && !validatePassword(value)) {
    return "Password must include a capital letter, a number, a symbol, and be at least 8 characters long.";
  } else if (name === "password" && !value.trim()) {
    return "Password cannot be empty.";
  }
  return "";
};

export const searchDelay = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function observableToPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.subscribe({
      next: (value) => resolve(value),
      error: (err) => reject(err),
    });
  });
}

export const getCroppedImg = (imageSrc: string, crop: Area): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = crop.width;
      canvas.height = crop.height;

      if (!ctx) {
        return reject(new Error("Could not get canvas context"));
      }

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "croppedImage.jpg", {
            type: "image/jpeg",
          });
          resolve(file);
        } else {
          reject(new Error("Canvas is empty"));
        }
      }, "image/jpeg");
    };

    image.onerror = () => {
      reject(new Error("Image loading failed"));
    };
  });
};

export const createImage = (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export const passwordValidation = (password: string) => {
  const minLength = /.{8,}/;
  const hasUpperCase = /[A-Z]/;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;
  if (password.length === 0) {
    return null;
  }
  if (!minLength.test(password)) {
    return "Password must be at least 8 characters long.";
  }
  if (!hasUpperCase.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasSymbol.test(password)) {
    return "Password must contain at least one special symbol.";
  }
  return null;
};

// Validate that at least one route type is selected
export const validateRouteType = (routeType: string | null): boolean => {
  return routeType !== null;
};

// Validate that at least one day is selected if the route is weekly
export const validateRouteDays = (
  routeType: string,
  routeDays: string[]
): boolean => {
  return (
    routeType === "DAILY" || (routeType === "WEEKLY" && routeDays.length > 0)
  );
};

// Validate that a bus is selected
export const validateBusSelection = (selectedBus: any): boolean => {
  return selectedBus !== null;
};

// Validate that departure and arrival locations and times are provided
export const validateLocationsAndTimes = (
  departureLocation: any,
  arrivalLocation: any,
  departureTime: string,
  arrivalTime: string
): boolean => {
  return (
    !!departureLocation && !!arrivalLocation && !!departureTime && !!arrivalTime
  );
};

export const validateTicketPrices = (
  prices: { fromIndex: number; toIndex: number; price: number | null }[],
  numberOfStops: number
): boolean => {
  // Generate all required combinations
  const requiredCombinations: { fromIndex: number; toIndex: number }[] = [];

  // From Departure Point (-1) to Stops and Arrival Point
  for (let toIndex = 0; toIndex <= numberOfStops; toIndex++) {
    requiredCombinations.push({ fromIndex: -1, toIndex });
  }

  // From each Stop to subsequent Stops and Arrival Point
  for (let fromIndex = 0; fromIndex < numberOfStops; fromIndex++) {
    for (let toIndex = fromIndex + 1; toIndex <= numberOfStops; toIndex++) {
      requiredCombinations.push({ fromIndex, toIndex });
    }
  }

  // Now check that each required combination is present and valid
  return requiredCombinations.every((combo) => {
    const priceEntry = prices.find(
      (price) =>
        price.fromIndex === combo.fromIndex && price.toIndex === combo.toIndex
    );

    return (
      priceEntry &&
      priceEntry.price !== null &&
      priceEntry.price !== undefined &&
      !isNaN(priceEntry.price) &&
      priceEntry.price > 0
    );
  });
};

// Validate that stop times are filled if stops are added
export const validateStops = (
  stops: { arrivalTime: string; departureTime: string }[]
): boolean => {
  return stops.every((stop) => stop.arrivalTime && stop.departureTime);
};

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M"; // Millions
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K"; // Thousands
  } else {
    return value.toFixed(1); // Less than 1000, show as is
  }
}

export function formatTickets(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + "M"; // Millions
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "K"; // Thousands
  } else {
    return value.toFixed(0); // Less than 1000, show as is
  }
}
