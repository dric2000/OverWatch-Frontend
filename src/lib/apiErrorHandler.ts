import { type SerializedError } from "@reduxjs/toolkit";
import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface ApiError {
  message: string;
  details?: Record<string, string[]>;
}

const statusMessages: Record<number, string> = {
  400: "Requête invalide",
  401: "Non authentifié",
  403: "Accès refusé",
  404: "Ressource non trouvée",
  409: "Conflit de données",
  500: "Erreur interne du serveur",
  503: "Service indisponible",
};

export function handleApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): ApiError {
  if (error && "status" in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.data as any;

    // ✅ FORMAT OverWatch (success: false, error: { code, message, details })
    if (data?.error) {
      // ✅ Si error.message est "Une erreur est survenue", on cherche dans les détails
      if (
        data.error.message === "Une erreur est survenue" &&
        data.error.details
      ) {
        // Parcourir les détails pour extraire les messages
        const messages: string[] = [];
        const details = data.error.details;

        for (const key of Object.keys(details)) {
          const value = details[key];
          if (Array.isArray(value)) {
            for (const msg of value) {
              if (typeof msg === "string") {
                messages.push(msg);
              }
            }
          } else if (typeof value === "string") {
            messages.push(value);
          }
        }

        if (messages.length > 0) {
          return {
            message: messages.join(", "),
            details: details,
          };
        }
      }

      // Sinon, utiliser le message de l'erreur
      if (data.error.message) {
        return {
          message: data.error.message,
          details: data.error.details,
        };
      }
    }

    // Format DRF detail
    if (data?.detail) {
      return { message: data.detail };
    }

    // Format DRF avec champs (fallback)
    if (typeof data === "object" && data !== null) {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const errorMessages: string[] = [];

        for (const key of keys) {
          const value = data[key];
          if (Array.isArray(value)) {
            for (const msg of value) {
              if (typeof msg === "string") {
                errorMessages.push(msg);
              }
            }
          } else if (typeof value === "string") {
            errorMessages.push(value);
          }
        }

        if (errorMessages.length > 0) {
          return {
            message: errorMessages.join(", "),
            details: data,
          };
        }
      }
    }

    // Erreur HTTP générique
    const status = typeof error.status === "number" ? error.status : 500;
    return {
      message: statusMessages[status] || `Erreur ${status}`,
    };
  }

  if (error && "message" in error) {
    return { message: error.message || "Une erreur est survenue" };
  }

  return { message: "Une erreur inattendue est survenue" };
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const apiError = handleApiError(error as FetchBaseQueryError);
    return apiError.message;
  }

  if (error && typeof error === "object" && "data" in error) {
    const apiError = handleApiError(error as FetchBaseQueryError);
    return apiError.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Une erreur est survenue";
}
