import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SizeSelector from "../components/SizeSelector"; // Importa il componente SizeSelector
import "../style/SingleProductPage.css";
import RelatedProducts from "../components/RelatedProducts";

export default function SingleProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const endPoint = `${import.meta.env.VITE_API_URL}/products/${slug}`;
  const [productSlug, setProductSlug] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProductsSlug();
  }, [slug]);

  function getProductsSlug() {
    setIsLoading(true);
    axios
      .get(endPoint)
      .then((res) => {
        setProductSlug(res.data.products || {});
        setError(null);
      })
      .catch((error) => {
        console.error("Errore nel recupero del prodotto:", error);
        setError("Prodotto non trovato");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const {
    id,
    name,
    description,
    price,
    image_url,
    image_still_life_url,
    fabric,
    discount,
    category_name,
    start_discount,
    end_discount,
    sku_order_code,
    brand,
    variations,
    category_slug,

  } = productSlug;

  const today = new Date();
  const start = start_discount ? new Date(start_discount) : null;
  const end = end_discount ? new Date(end_discount) : null;
  const isDiscountActive =
    discount &&
    start instanceof Date &&
    end instanceof Date &&
    today >= start &&
    today <= end;

  const finalPrice = isDiscountActive
    ? (price * (1 - discount / 100)).toFixed(2)
    : price;

  function handleGoBack() {
    navigate(-1);
  }

  // Funzione per gestire la selezione della taglia dal SizeSelector
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantità quando cambia taglia
  };

  // FUNZIONE AGGIORNATA per il nuovo CartContext
  function handleAddToCart() {
    if (!selectedSize) {
      alert("Seleziona una taglia prima di aggiungere al carrello");
      return;
    }

    try {
      // Chiama addToCart con i 3 parametri richiesti dal nuovo CartContext
      addToCart(productSlug, selectedSize, quantity);

      // Feedback visivo del pulsante
      const btn = document.querySelector(".btn-add-cart");
      btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Aggiunto!';
      btn.classList.add("btn-success");
      setTimeout(() => {
        btn.innerHTML =
          '<i class="bi bi-cart-plus me-2"></i>Aggiungi al carrello';
        btn.classList.remove("btn-success");
      }, 2000);

      console.log(
        `Aggiunto al carrello: ${name}, Taglia: ${selectedSize}, Quantità: ${quantity}`
      );
    } catch (error) {
      console.error("Errore aggiunta al carrello:", error);
      alert("Errore durante l'aggiunta al carrello");
    }
  }

  // Funzione per gestire il cambio quantità
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;

    // Controlla che non superi la quantità disponibile per la taglia selezionata
    if (selectedSize) {
      const selectedVariation = variations?.find(
        (v) => v.size === selectedSize
      );
      if (selectedVariation && newQuantity > selectedVariation.quantity) {
        alert(
          `Disponibili solo ${selectedVariation.quantity} pezzi per la taglia ${selectedSize}`
        );
        return;
      }
    }

    setQuantity(newQuantity);
  };

  const availableSizes =
    variations?.filter((variation) => variation.quantity > 0) || [];
  const isSoldOut = availableSizes.length === 0;

  // Ottieni la quantità disponibile per la taglia selezionata
  const getAvailableQuantityForSize = (size) => {
    const variation = variations?.find((v) => v.size === size);
    return variation ? variation.quantity : 0;
  };

  const selectedSizeQuantity = selectedSize
    ? getAvailableQuantityForSize(selectedSize)
    : 0;

  if (isLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div
                    className="spinner-border text-primary-green mb-3"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="text-muted">Caricamento prodotto...</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                <h3 className="text-danger mb-3">{error}</h3>
                <button
                  onClick={handleGoBack}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Torna indietro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light">
      {/* Breadcrumb */}
      <div className="container mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button
                onClick={handleGoBack}
                className="btn btn-link p-0 text-decoration-none"
              >
                <i className="bi bi-arrow-left me-2"></i>Prodotti
              </button>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {name}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container">
        <div className="row g-5">
          {/* Sezione Immagini */}
          <div className="col-lg-6">
            <div className="position-relative">
              {isDiscountActive && (
                <div
                  className="position-absolute top-0 start-0 m-3"
                  style={{ zIndex: 10 }}
                >
                  <span className="badge bg-danger fs-6 p-3 rounded-circle sale-badge">
                    -{discount}%
                  </span>
                </div>
              )}
              <div
                id="productCarousel"
                className="carousel slide shadow-lg rounded overflow-hidden"
              >
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img
                      src={image_url}
                      className="d-block w-100 product-main-image"
                      alt={name}
                      style={{ height: "500px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src={image_still_life_url}
                      className="d-block w-100 product-main-image"
                      alt={name}
                      style={{ height: "500px", objectFit: "cover" }}
                    />
                  </div>
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#productCarousel"
                  data-bs-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#productCarousel"
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sezione Dettagli Prodotto */}
          <div className="col-lg-6">
            <div className="product-details h-100">
              <div className="mb-4">
                <p className="name-brand text-primary-green fw-bold mb-2">
                  {brand}
                </p>
                <h1 className="display-5 fw-bold text-dark mb-3">{name}</h1>
                <div className="price-section mb-4">
                  {isDiscountActive ? (
                    <div>
                      <span className="text-decoration-line-through text-muted fs-4 me-3">
                        €{price}
                      </span>
                      <span className="text-success fs-2 fw-bold">
                        €{finalPrice}
                      </span>
                      <span className="badge bg-danger ms-2">
                        Risparmia €{(price - finalPrice).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-success fs-2 fw-bold">€{price}</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">Descrizione prodotto:</h5>
                <p className="text-muted lh-lg">{description}</p>
              </div>

              {/* INTEGRAZIONE DEL COMPONENTE SIZESELECTOR */}
              {id && (
                <div className="mb-4">
                  <SizeSelector
                    productId={id}
                    onSizeSelect={handleSizeSelect}
                    selectedSize={selectedSize}
                    disabled={isSoldOut}
                    showStock={true}
                  />
                </div>
              )}

              {/* SEZIONE QUANTITÀ */}
              {selectedSize && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Quantità:</h6>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center border rounded">
                      <button
                        type="button"
                        className="btn btn-sm px-3"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="px-3 py-2 bg-light border-start border-end">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm px-3"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= selectedSizeQuantity}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <small className="text-muted">
                      Totale: €{(finalPrice * quantity).toFixed(2)}
                    </small>
                  </div>
                  {quantity >= selectedSizeQuantity && (
                    <small className="text-warning d-block mt-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Hai raggiunto la quantità massima disponibile
                    </small>
                  )}
                </div>
              )}

              {/* Bottone Aggiungi al carrello */}
              <div className="d-grid gap-3 mb-4">
                <button
                  className="btn btn-lg bg-primary-green text-white fw-bold btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={isSoldOut || !selectedSize}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  {isSoldOut
                    ? "Non disponibile"
                    : !selectedSize
                      ? "Seleziona una taglia"
                      : `Aggiungi al carrello ${quantity > 1 ? `(${quantity})` : ""
                      }`}
                </button>
              </div>

              {/* Accordion Informazioni */}
              <div className="accordion" id="productAccordion">
                <div className="accordion-item border-0 mb-2">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed bg-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#sizeGuide"
                      aria-expanded="false"
                      aria-controls="sizeGuide"
                    >
                      <i className="bi bi-rulers me-2"></i>
                      <strong>Guida alle taglie</strong>
                    </button>
                  </h2>
                  <div
                    id="sizeGuide"
                    className="accordion-collapse collapse"
                    data-bs-parent="#productAccordion"
                  >
                    <div className="accordion-body bg-white">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Taglia</th>
                              <th>Torace (cm)</th>
                              <th>Vita (cm)</th>
                              <th>Fianchi (cm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>S</td>
                              <td>86-91</td>
                              <td>71-76</td>
                              <td>91-96</td>
                            </tr>
                            <tr>
                              <td>M</td>
                              <td>96-101</td>
                              <td>81-86</td>
                              <td>101-106</td>
                            </tr>
                            <tr>
                              <td>L</td>
                              <td>106-111</td>
                              <td>91-96</td>
                              <td>111-116</td>
                            </tr>
                            <tr>
                              <td>XL</td>
                              <td>116-121</td>
                              <td>101-106</td>
                              <td>121-126</td>
                            </tr>
                            <tr>
                              <td>XXL</td>
                              <td>126-131</td>
                              <td>111-116</td>
                              <td>131-136</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed bg-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#shipping"
                      aria-expanded="false"
                      aria-controls="shipping"
                    >
                      <i className="bi bi-truck me-2"></i>
                      <strong>Spedizione e Resi</strong>
                    </button>
                  </h2>
                  <div
                    id="shipping"
                    className="accordion-collapse collapse"
                    data-bs-parent="#productAccordion"
                  >
                    <div className="accordion-body bg-white">
                      <div className="row g-3">
                        <div className="col-12">
                          <h6 className="fw-bold text-success">
                            <i className="bi bi-truck me-2"></i>Spedizione
                            Gratuita
                          </h6>
                          <p className="small text-muted mb-3">
                            Spedizione gratuita per ordini superiori a €150.
                            Consegna in 2-3 giorni lavorativi.
                          </p>
                        </div>
                        <div className="col-12">
                          <h6 className="fw-bold">
                            <i className="bi bi-arrow-return-left me-2"></i>Resi
                            Gratuiti
                          </h6>
                          <p className="small text-muted mb-0">
                            Resi gratuiti entro 30 giorni dall'acquisto. Il
                            prodotto deve essere nelle condizioni originali.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione Descrizione Estesa */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="desc-prod rounded p-5">
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="bg-white bg-opacity-10 rounded p-4 h-100">
                    <h5 className="text-white fw-bold mb-3">
                      Perché scegliere questo prodotto
                    </h5>
                    <p className="text-white-50 lh-lg">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Cras et commodo ex. In consequat ac lacus ut semper,
                      interdum ac orci. Vestibulum ante ipsum primis in faucibus
                      orci luctus et ultrices.
                    </p>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="bg-white bg-opacity-10 rounded p-4 h-100">
                    <h5 className="text-white fw-bold mb-3">
                      Specifiche tecniche
                    </h5>
                    <div className="list-unstyled text-white-50">
                      <div className="d-flex justify-content-between py-2 border-bottom border-white-50">
                        <span>SKU:</span>
                        <span className="text-white">{sku_order_code}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2 border-bottom border-white-50">
                        <span>Materiale:</span>
                        <span className="text-white">{fabric}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2">
                        <span>Brand:</span>
                        <span className="text-white">{brand}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione prodotti correlati */}
        <div className="accordion mt-5" id="relatedProductsAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#relatedProducts"
                aria-expanded="false"
                aria-controls="relatedProducts"
              >
                🔗 Vedi prodotti correlati
              </button>
            </h2>
            <div id="relatedProducts" className="accordion-collapse collapse">
              <div className="accordion-body">
                <RelatedProducts category_slug={category_slug} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}