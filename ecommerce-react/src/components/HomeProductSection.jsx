import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { PremiumCard } from "./PremiumCard";
import { CompactCard } from "./CompactCard";
import "../style/HomeProductSection.css";

export function HomeProductSection() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isBestSellerSection, setBestSellerSection] = useState(true);

  const endPoint = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(endPoint)
      .then((res) => {
        setNewArrivals(res.data.products.newArrivals || []);
        setBestSellers(res.data.products.highestPriced || []);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  // Funzione per renderizzare le righe di prodotti
  const renderProductRows = (productsToRender) => {
    if (!productsToRender || productsToRender.length === 0) {
      return (
        <div className="no-products-message">
          <p>Nessun prodotto disponibile in questa sezione.</p>
        </div>
      );
    }

    const firstRowProducts = productsToRender.slice(0, 3);
    const secondRowProducts = productsToRender.slice(3, 7); // Max 4 per la seconda riga

    return (
      <>
        {/* Prima riga - Card Premium (3 elementi) */}
        <div className="row premium-row mb-5">
          {firstRowProducts.map((product) => (
            <PremiumCard key={product.id} product={product} />
          ))}
        </div>

        {/* Seconda riga - Card Compatte (4 elementi) */}
        {secondRowProducts.length > 0 && (
          <div className="row compact-row">
            {secondRowProducts.map((product) => (
              <CompactCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container my-5">
      <div className="featured-header d-flex justify-content-between align-items-center mb-5">
        <h2 className="featured-title mb-0 me-4">FEATURED PRODUCTS</h2>

        <div className="featured-tabs">
          <button
            className={`featured-tab ${isBestSellerSection ? "active" : ""}`}
            onClick={() => setBestSellerSection(true)}
          >
            BEST SELLERS
          </button>
          <button
            className={`featured-tab ${!isBestSellerSection ? "active" : ""}`}
            onClick={() => setBestSellerSection(false)}
          >
            NEW ARRIVALS
          </button>
        </div>
      </div>

      <div className="products-container">
        {isBestSellerSection
          ? renderProductRows(bestSellers)
          : renderProductRows(newArrivals)}
      </div>

      <div className="text-center mt-5">
        <Link
          to={
            isBestSellerSection
              ? "/products?sort_by=price_desc"
              : "/products?sort_by=latest"
          }
          className="view-more-btn"
        >
          View More
        </Link>
      </div>
    </div>
  );
}
