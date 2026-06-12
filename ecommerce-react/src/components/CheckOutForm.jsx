import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useInventory } from "../hooks/useInventory";
import emailjs from "@emailjs/browser";

// Componente per il form di checkout integrato (SEMPLIFICATO)
const CheckoutForm = ({
  cartItems,
  totalAmount,
  onOrderSuccess,
  onCancel,
  discountInfo,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    billing_address: "",
    shipping_address: "",
    country: "italia",
    same_address: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { processOrder } = useInventory();
  const { clearCart } = useCart();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Rimuovi errore quando l'utente corregge
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Nome e cognome
    if (!formData.name || formData.name.length < 3) {
      errors.name = "Il nome deve essere di almeno 3 caratteri";
    }
    if (!formData.surname || formData.surname.length < 3) {
      errors.surname = "Il cognome deve essere di almeno 3 caratteri";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Inserisci un indirizzo email valido";
    }

    // Telefono
    if (
      !formData.phone ||
      formData.phone.length < 7 ||
      formData.phone.length > 20
    ) {
      errors.phone = "Il telefono deve essere tra 7 e 20 cifre";
    }

    // Indirizzo fatturazione
    if (!formData.billing_address || formData.billing_address.length < 10) {
      errors.billing_address = "L'indirizzo deve essere di almeno 10 caratteri";
    }

    // Indirizzo spedizione (se diverso)
    if (!formData.same_address) {
      if (!formData.shipping_address || formData.shipping_address.length < 10) {
        errors.shipping_address =
          "L'indirizzo di spedizione deve essere di almeno 10 caratteri";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const sendConfirmationEmail = () => {
    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          amount: totalAmount.toFixed(2),
          billing_address: formData.billing_address,
          shipping_address: formData.same_address
            ? formData.billing_address
            : formData.shipping_address
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then((result) => {
        console.log("Email inviata con successo!", result.text);
        console.log("BILLING", formData.billing_address, "SHIPPING", formData.shipping_address)
      })
      .catch((error) => {
        console.error("Errore nell'invio dell'email:", error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      //  sendConfirmationEmail();

      // **Prepare the 'items' array for the backend**
      const formattedCartItems = cartItems.map((item) => ({
        productId: item.id, // Ensure your cart item has an 'id' property
        size: item.selectedSize, // Ensure your cart item has 'selectedSize'
        quantity: item.quantity,
        price: item.price // Ensure your cart item has 'quantity'
      }));

      // **Prepare the 'orderInfo' and customer details for the backend**
      // These are merged directly into the top level of the payload
      const orderPayload = {
        items: formattedCartItems, // This is the 'items' array the backend expects
        // All customer details and order summary details are at the root level of the payload
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        billing_address: formData.billing_address,
        // Ensure shipping_address is correct based on 'same_address' checkbox
        shipping_address: formData.same_address
          ? formData.billing_address
          : formData.shipping_address,
        country: formData.country,
        // The total amount is also a top-level property
        amount: totalAmount, // This matches the 'amount' expected in req.body.amount
        // You can add other order summary details here if the backend expects them at the root
        // For example, if you want discount_applied or discount_code to be stored with the order
        // and not just passed for internal logic within the backend.
        discount_applied: discountInfo.validPromo
          ? discountInfo.appliedPromoPercentage
          : 0,
        discount_code: discountInfo.discountCode || null,
        items_count: cartItems.length,
        total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        order_date: new Date().toISOString(), // This might be handled by backend, but safe to send
      };


      // Call the processOrder function from useInventory hook.
      // This function should internally make the axios.post call to your backend.
      // It should receive the 'orderPayload' as its single argument.
      console.log("Payload inviato a processOrder (frontend):", orderPayload);
      const result = await processOrder(orderPayload); // <--- HERE'S THE CHANGE

      if (result.success) {
        clearCart();
        onOrderSuccess(result);
      } else {
        throw new Error(
          result.message || "Errore nel processamento dell'ordine"
        );
      }
    } catch (error) {
      console.error("Errore invio ordine:", error);
      setFormErrors({
        submit:
          error.message || "Errore nel processamento dell'ordine. Riprova.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Completa il tuo ordine</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onCancel}
          disabled={isSubmitting}
        ></button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informazioni personali */}
        <div className="row mb-4">
          <div className="col-12">
            <h6 className="fw-semibold mb-3 text-primary">
              Informazioni Personali
            </h6>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Nome *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Il tuo nome"
            />
            {formErrors.name && (
              <div className="invalid-feedback">{formErrors.name}</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Cognome *</label>
            <input
              type="text"
              name="surname"
              className={`form-control ${formErrors.surname ? "is-invalid" : ""
                }`}
              value={formData.surname}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Il tuo cognome"
            />
            {formErrors.surname && (
              <div className="invalid-feedback">{formErrors.surname}</div>
            )}
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="la-tua-email@esempio.com"
            />
            {formErrors.email && (
              <div className="invalid-feedback">{formErrors.email}</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Telefono *</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="+39 123 456 7890"
            />
            {formErrors.phone && (
              <div className="invalid-feedback">{formErrors.phone}</div>
            )}
          </div>
        </div>

        {/* Indirizzi */}
        <div className="row mb-4">
          <div className="col-12">
            <h6 className="fw-semibold mb-3 text-primary">Indirizzi</h6>
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Indirizzo di Fatturazione *</label>
            <textarea
              name="billing_address"
              className={`form-control ${formErrors.billing_address ? "is-invalid" : ""
                }`}
              value={formData.billing_address}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows="3"
              placeholder="Via, numero civico, città, CAP, provincia"
            />
            {formErrors.billing_address && (
              <div className="invalid-feedback">
                {formErrors.billing_address}
              </div>
            )}
          </div>

          <div className="col-12 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="same_address"
                className="form-check-input"
                checked={formData.same_address}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <label className="form-check-label">
                L'indirizzo di spedizione è uguale a quello di fatturazione
              </label>
            </div>
          </div>

          {!formData.same_address && (
            <div className="col-12 mb-3">
              <label className="form-label">Indirizzo di Spedizione *</label>
              <textarea
                name="shipping_address"
                className={`form-control ${formErrors.shipping_address ? "is-invalid" : ""
                  }`}
                value={formData.shipping_address}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows="3"
                placeholder="Via, numero civico, città, CAP, provincia"
              />
              {formErrors.shipping_address && (
                <div className="invalid-feedback">
                  {formErrors.shipping_address}
                </div>
              )}
            </div>
          )}

          <div className="col-md-6 mb-3">
            <label className="form-label">Paese *</label>
            <select
              name="country"
              className="form-select"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="italia">Italia</option>
              <option value="francia">Francia</option>
              <option value="germania">Germania</option>
              <option value="spagna">Spagna</option>
              <option value="austria">Austria</option>
              <option value="svizzera">Svizzera</option>
            </select>
          </div>
        </div>

        {/* Errore generale */}
        {formErrors.submit && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {formErrors.submit}
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Torna al Carrello
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-grow-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processando...
              </>
            ) : (
              <>
                <i className="bi bi-credit-card me-2"></i>
                Conferma Ordine - €{totalAmount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
