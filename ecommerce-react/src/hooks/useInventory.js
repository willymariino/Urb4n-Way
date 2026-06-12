import { useState } from "react";
import axios from "axios";

export const useInventory = () => {
  const [loading, setLoading] = useState(false);

  const checkCartAvailability = async (cartItems) => {
    try {
      setLoading(true);

      const items = cartItems.map((item) => ({
        productId: item.id,
        size: item.selectedSize,
        quantity: item.quantity,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/availability/check-cart`,
        { items }
      );

      return response.data;
    } catch (error) {
      console.error("Errore controllo disponibilità carrello:", error);
      return {
        success: false,
        allAvailable: false,
        message:
          error.response?.data?.message || "Errore controllo disponibilità",
      };
    } finally {
      setLoading(false);
    }
  };

  // --- START OF REQUIRED CHANGE FOR processOrder ---
  // Change the parameters to accept a single 'orderData' object
  const processOrder = async (orderData) => { // <--- CHANGED THIS LINE
    try {
      setLoading(true);

      // No need to map cartItems here, they are ALREADY mapped and
      // available as 'items' within the 'orderData' object
      // const items = cartItems.map((item) => ({ ... })); // <-- REMOVE THIS BLOCK IF PRESENT

      // The orderData object already contains 'items' and all other customer/order details
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/availability/process-order`,
        orderData
      );

      return response.data;
    } catch (error) {
      console.error("Errore processamento ordine (from useInventory):", error); // Added context to log
      // Log more details about the error response for backend debugging
      if (error.response) {
        console.error("Backend error response data:", error.response.data);
        console.error("Backend error status:", error.response.status);
        console.error("Backend error headers:", error.response.headers);
      }
      throw new Error(
        error.response?.data?.message || "Errore processamento ordine"
      );
    } finally {
      setLoading(false);
    }
  };
  // --- END OF REQUIRED CHANGE FOR processOrder ---

  return {
    checkCartAvailability,
    processOrder,
    loading,
  };
};