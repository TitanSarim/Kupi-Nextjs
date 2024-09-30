// Validation for email
import { Area } from "react-easy-crop";
import { Observable } from "rxjs";

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const numberRegex = /^\+?[0-9]{1,15}$/;
  return numberRegex.test(number);
};

// Ensure password complexity
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/; // Enforce minimum length of 8
  return passwordRegex.test(password);
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
