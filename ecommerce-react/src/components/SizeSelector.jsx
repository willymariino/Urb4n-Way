import { useState, useEffect } from "react";
import axios from "axios";
import "../style/SizeSelector.css";

const SizeSelector = ({
  productId,
  onSizeSelect,
  selectedSize,
  disabled = false,
  showStock = true,
  outOfStockStyle = "diagonal", // "diagonal", "dotted", "dashed", "strikethrough"
}) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/availability/product/${productId}/availability`
        );

        if (response.data.success) {
          setAvailability(response.data.availability);
        } else {
          setError("Errore nel caricamento delle taglie disponibili");
        }
      } catch (err) {
        console.error("Errore fetch availability:", err);
        setError("Errore nel caricamento delle taglie");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchAvailability();
    }
  }, [productId]);

  const handleSizeClick = (size, isAvailable) => {
    if (!isAvailable || disabled) return;
    onSizeSelect(size);
  };

  const getOutOfStockClass = () => {
    switch (outOfStockStyle) {
      case "dotted":
        return "dotted-pattern";
      case "dashed":
        return "dashed-border";
      case "strikethrough":
        return "strikethrough";
      case "diagonal":
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="size-selector">
        <h6 className="fw-bold mb-3">Seleziona Taglia:</h6>
        <div className="d-flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="placeholder-glow">
              <span className="placeholder size-placeholder"></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="size-selector">
        <h6 className="fw-bold mb-3">Seleziona Taglia:</h6>
        <div className="alert alert-warning small py-2">{error}</div>
      </div>
    );
  }

  return (
    <div className="size-selector">
      <h6 className="fw-bold mb-3">Seleziona Taglia:</h6>
      <div className="d-flex flex-wrap gap-2">
        {availability.map((sizeInfo) => (
          <button
            key={sizeInfo.size}
            type="button"
            className={`btn size-btn ${selectedSize === sizeInfo.size
                ? "btn-primary"
                : sizeInfo.available
                  ? "btn-outline-primary"
                  : `btn-outline-secondary ${getOutOfStockClass()}`
              }`}
            onClick={() => handleSizeClick(sizeInfo.size, sizeInfo.available)}
            disabled={!sizeInfo.available || disabled}
            title={
              sizeInfo.available
                ? showStock
                  ? `${sizeInfo.size} - ${sizeInfo.quantity} disponibili`
                  : sizeInfo.size
                : `${sizeInfo.size} - Non disponibile`
            }
          >
            {sizeInfo.size}
          </button>
        ))}
      </div>

      {selectedSize && (
        <div className="mt-2">
          <small className="text-success">
            <i className="bi bi-check-circle me-1"></i>
            Taglia {selectedSize} selezionata
          </small>
        </div>
      )}
    </div>
  );
};

export default SizeSelector;
