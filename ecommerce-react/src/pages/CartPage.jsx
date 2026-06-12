import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useInventory } from "../hooks/useInventory";
import CheckoutForm from "../components/CheckOutForm.jsx";
import AvailabilityWarning from "../components/AvailabilityWarning.jsx";
import OrderConfirmationModal from "../components/OrderConfirmationModal.jsx";
import "../style/CartPage.css";

// Componente principale CartPage
export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { checkCartAvailability } = useInventory();

  const [discountCode, setDiscountCode] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [validPromo, setValidPromo] = useState(false);
  const [appliedPromoPercentage, setAppliedPromoPercentage] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const endPointDiscount = `${import.meta.env.VITE_API_URL}/checkout/discount-code`;

  // Stati per OrderConfirmationModal
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const [availabilityStatus, setAvailabilityStatus] = useState({
    checked: false,
    allAvailable: true,
    unavailableItems: [],
  });

  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const today = new Date();

  // Funzione per controllare disponibilità del carrello
  const checkCartItemsAvailability = async () => {
    if (cartItems.length === 0) return;

    setIsCheckingAvailability(true);

    try {
      const result = await checkCartAvailability(cartItems);

      if (result.success) {
        const unavailableItems = result.items
          .filter((item) => !item.available)
          .map((item) => {
            const cartItem = cartItems.find(
              (ci) => ci.id === item.productId && ci.selectedSize === item.size
            );
            return {
              ...item,
              name: cartItem?.name || "Prodotto",
              size: item.size,
              message: item.message,
            };
          });

        setAvailabilityStatus({
          checked: true,
          allAvailable: result.allAvailable,
          unavailableItems: unavailableItems,
        });
      }
    } catch (error) {
      console.error("Errore controllo disponibilità:", error);
      setAvailabilityStatus({
        checked: true,
        allAvailable: false,
        unavailableItems: [
          {
            name: "Errore generale",
            size: "",
            message: "Impossibile verificare la disponibilità. Riprova.",
          },
        ],
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Controlla disponibilità quando il carrello cambia
  useEffect(() => {
    if (cartItems.length > 0) {
      checkCartItemsAvailability();
    } else {
      setAvailabilityStatus({
        checked: false,
        allAvailable: true,
        unavailableItems: [],
      });
    }
  }, [cartItems]);

  // Calcolo del subtotale con eventuali sconti individuali
  const calculateSubtotal = () => {
    let subtotal = 0;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity);
      const start = new Date(item.start_discount);
      const end = new Date(item.end_discount);

      let finalPrice = price;
      if (
        item.is_visible_prod === 1 &&
        today >= start &&
        today <= end &&
        item.discount
      ) {
        const discount = parseFloat(item.discount);
        finalPrice = price - (price * discount) / 100;
      }

      subtotal += finalPrice * quantity;
    }

    return subtotal;
  };

  const subtotal = calculateSubtotal();

  // Spedizione gratuita sopra i 100€, altrimenti 5.99
  const shippingCost = subtotal >= 100 ? 0 : 5.99;

  // Totale con eventuale codice sconto
  let total = subtotal + shippingCost;
  if (validPromo && appliedPromoPercentage > 0) {
    total -= (total * appliedPromoPercentage) / 100;
  }

  const handleDiscountSubmit = (e) => {
    e.preventDefault();
    setPromoMessage("Verifica codice...");

    axios
      .get(endPointDiscount)
      .then((res) => {
        const fetchedPromos = res.data.promos;
        const foundPromo = fetchedPromos.find(
          (promo) =>
            promo.code === discountCode &&
            promo.is_valid === 1 &&
            new Date(promo.start_discount) <= today &&
            new Date(promo.end_discount) >= today
        );

        if (foundPromo) {
          const discountValue = parseFloat(foundPromo.discount);
          if (!isNaN(discountValue)) {
            setValidPromo(true);
            setAppliedPromoPercentage(discountValue);
            setPromoMessage("Codice sconto applicato!");
          } else {
            setValidPromo(false);
            setAppliedPromoPercentage(0);
            setPromoMessage("Errore: valore sconto non valido.");
          }
        } else {
          setValidPromo(false);
          setAppliedPromoPercentage(0);
          setPromoMessage("Codice sconto non valido o scaduto.");
        }
      })
      .catch((err) => {
        console.error("Errore nel recupero codici sconto:", err);
        setPromoMessage("Errore nella verifica del codice.");
      });
  };

  // Funzione modificata per mostrare il modal invece dell'alert
  const handleCheckoutSuccess = (orderData) => {
    console.log("Ordine completato:", orderData);
    setShowCheckoutForm(false);

    // Mostra il modal di conferma invece dell'alert
    setOrderCode(orderData.orderId || "N/A");
    setShowOrderConfirmation(true);
  };

  const handleCheckoutCancel = () => {
    setShowCheckoutForm(false);
  };

  const handleProceedToCheckout = () => {
    if (!availabilityStatus.allAvailable) {
      alert(
        "Non puoi procedere al checkout finché ci sono prodotti non disponibili nel carrello."
      );
      return;
    }
    setShowCheckoutForm(true);
  };

  return (
    <div className="container cart-container">
      <h1 className="cart-title">Il tuo Carrello</h1>

      {/* Modal di conferma ordine */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        orderCode={orderCode}
      />

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <i className="bi bi-cart-x empty-cart-icon" />
          <h3>Il carrello è vuoto</h3>
          <p>Aggiungi alcuni prodotti per iniziare</p>
          <Link to="/products" className="btn continue-shopping-btn">
            Continua lo Shopping
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Lista prodotti */}
          <div className="col-lg-8 cart-items-section">
            {/* Warning per disponibilità */}
            <AvailabilityWarning
              unavailableItems={availabilityStatus.unavailableItems}
              onRecheck={checkCartItemsAvailability}
            />

            {/* Indicatore controllo disponibilità */}
            {isCheckingAvailability && (
              <div className="availability-checking">
                <div className="d-flex align-items-center">
                  <span className="spinner-border spinner-border-sm"></span>
                  Controllo disponibilità prodotti...
                </div>
              </div>
            )}

            <div className="cart-item-wrapper">
              {cartItems.map((item, index) => {
                const price = parseFloat(item.price);
                const quantity = parseInt(item.quantity);
                const start = new Date(item.start_discount);
                const end = new Date(item.end_discount);

                let finalPrice = price;
                let hasDiscount = false;
                if (
                  item.is_visible_prod === 1 &&
                  today >= start &&
                  today <= end &&
                  item.discount
                ) {
                  const discount = parseFloat(item.discount);
                  finalPrice = price - (price * discount) / 100;
                  hasDiscount = true;
                }

                // Trova se questo item ha problemi di disponibilità
                const availabilityIssue =
                  availabilityStatus.unavailableItems.find(
                    (unavailable) =>
                      unavailable.productId === item.id &&
                      unavailable.size === item.selectedSize
                  );

                return (
                  <div key={`${item.id}_${item.selectedSize}`}>
                    <div
                      className={`cart-item ${availabilityIssue ? "unavailable" : ""
                        }`}
                    >
                      <div className="row align-items-center">
                        <div className="col-md-3 col-4">
                          <div className="cart-item-image">
                            <img src={item.image_url} alt={item.name} />
                            {availabilityIssue && (
                              <span className="availability-badge">
                                <i className="bi bi-exclamation-triangle"></i>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-md-5 col-8">
                          <div className="product-info">
                            <Link
                              to={`/products/${item.slug}`}
                              className="text-decoration-none text-dark"
                            >
                              <h5>{item.name}</h5>
                              <p className="product-description">
                                {item.description}
                              </p>
                            </Link>

                            <div className="product-badges">
                              <span className="badge product-badge">
                                Taglia: {item.selectedSize}
                              </span>
                              <span className="badge product-badge">
                                Qty: {quantity}
                              </span>
                              {hasDiscount && (
                                <span className="badge product-badge discount-badge">
                                  -{item.discount}%
                                </span>
                              )}
                            </div>

                            {availabilityIssue && (
                              <div className="availability-issue">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {availabilityIssue.message}
                              </div>
                            )}

                            <div className="quantity-controls">
                              <button
                                className="btn quantity-btn"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                title="Diminuisci quantità"
                              >
                                −
                              </button>
                              <span className="quantity-display">
                                {item.quantity}
                              </span>
                              <button
                                className="btn quantity-btn"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.quantity + 1
                                  )
                                }
                                title="Aumenta quantità"
                              >
                                +
                              </button>
                              <button
                                className="btn quantity-btn remove-btn"
                                onClick={() =>
                                  removeFromCart(item.id, item.selectedSize)
                                }
                                title="Rimuovi dal carrello"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 price-section">
                          {hasDiscount ? (
                            <>
                              <div className="original-price">
                                €{price.toFixed(2)}
                              </div>
                              <div className="current-price">
                                €{finalPrice.toFixed(2)}
                              </div>
                              <div className="total-price">
                                Totale: €{(finalPrice * quantity).toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="regular-price">
                                €{price.toFixed(2)}
                              </div>
                              <div className="total-price">
                                Totale: €{(price * quantity).toFixed(2)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < cartItems.length - 1 && (
                      <hr className="item-separator" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Riepilogo ordine */}
          <div className="col-lg-4 order-summary">
            <div className="summary-card">
              <div className="summary-header">
                {showCheckoutForm ? "Checkout" : "Riepilogo Ordine"}
              </div>
              <div className="summary-body">
                {!showCheckoutForm ? (
                  <>
                    <div className="summary-row">
                      <span>Subtotale prodotti:</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Spedizione:</span>
                      <span>
                        {shippingCost === 0
                          ? "GRATIS"
                          : `€${shippingCost.toFixed(2)}`}
                      </span>
                    </div>

                    {validPromo && appliedPromoPercentage > 0 && (
                      <div className="summary-row discount-row">
                        <span>Sconto promo:</span>
                        <span>
                          -€
                          {(
                            ((subtotal + shippingCost) *
                              appliedPromoPercentage) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="summary-row total-row">
                      <span>Totale:</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>

                    <div className="discount-section">
                      <label className="discount-label">Codice Sconto</label>
                      <form onSubmit={handleDiscountSubmit}>
                        <div className="discount-input-group">
                          <input
                            type="text"
                            className="discount-input"
                            placeholder="Inserisci codice"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                          />
                          <button className="discount-btn" type="submit">
                            Applica
                          </button>
                        </div>

                        {promoMessage && (
                          <small
                            className={`discount-message ${validPromo ? "discount-success" : "discount-error"
                              }`}
                          >
                            {promoMessage}
                          </small>
                        )}
                      </form>
                    </div>

                    <div className="checkout-btn-wrapper">
                      <button
                        onClick={handleProceedToCheckout}
                        className={`btn checkout-btn ${!availabilityStatus.allAvailable ? "unavailable" : ""
                          } ${isCheckingAvailability ? "checking" : ""}`}
                        disabled={
                          !availabilityStatus.allAvailable ||
                          isCheckingAvailability
                        }
                      >
                        {!availabilityStatus.allAvailable ? (
                          <>
                            <i className="bi bi-exclamation-triangle"></i>
                            Risolvi Problemi Disponibilità
                          </>
                        ) : isCheckingAvailability ? (
                          <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Controllo...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-credit-card"></i>
                            Procedi al Checkout
                          </>
                        )}
                      </button>
                    </div>

                    <div className="continue-shopping-link">
                      <Link to="/products">← Continua lo Shopping</Link>
                    </div>
                  </>
                ) : (
                  // Form di checkout integrato
                  <CheckoutForm
                    cartItems={cartItems}
                    totalAmount={total}
                    onOrderSuccess={handleCheckoutSuccess}
                    onCancel={handleCheckoutCancel}
                    discountInfo={{
                      validPromo,
                      appliedPromoPercentage,
                      discountCode,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
