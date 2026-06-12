// ProductsPage.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FilterSection from "../components/FilterSection.jsx";
import ProductCard from "../components/ProductCard.jsx"; // Import del nuovo componente
import { useSearch } from "../context/SearchContext.jsx"
import axios from "axios";

import "../style/ProductsPage.css";

export default function ProductPage() {
  const { searchTerm, searchSubmitted } = useSearch();
  const [products, setProducts] = useState([]);
  const [defaultProducts, setDefaultProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const location = useLocation();
  const endPoint = `${import.meta.env.VITE_API_URL}/products`;

  const buildApiParams = () => {
    const queryParams = new URLSearchParams(location.search);
    const params = {};

    if (queryParams.get("search")) params.q = queryParams.get("search");
    if (queryParams.get("sort_by")) params.sort_by = queryParams.get("sort_by");
    if (queryParams.get("brand")) params.brand = queryParams.get("brand");
    if (queryParams.get("fabric")) params.fabric = queryParams.get("fabric");
    if (queryParams.get("min_price"))
      params.min_price = queryParams.get("min_price");
    if (queryParams.get("max_price"))
      params.max_price = queryParams.get("max_price");
    if (queryParams.get("discount"))
      params.discount = queryParams.get("discount");

    return params;
  };

  function getProducts() {
    const params = buildApiParams();
    setLoading(true);
    axios
      .get(endPoint, { params })
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => {
        console.error("Errore nel recupero dei prodotti:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false))
  }

  function getdefaultProducts() {
    axios
      .get(endPoint)
      .then((res) => {
        setDefaultProducts(res.data.products);
      })
      .catch((err) => {
        console.error("Errore nel recupero dei prodotti di default:", err);
      });
  }

  useEffect(() => {
    getProducts();
  }, [location.search]);

  useEffect(() => {
    getdefaultProducts();
  }, []);

  const currentSearchTerm = new URLSearchParams(location.search).get("search");

  return (!isLoading ?
    <div className="container-fluid py-5">
      <div className="container">
        {/* Passa i parametri di default */}
        <FilterSection defaultProducts={defaultProducts} />
        {currentSearchTerm && <div className="m-3 text-center fs-4">Prodotti Cercati: <span className="fw-bolder">{currentSearchTerm}</span></div>}
        {/* Products Grid */}
        <div className="row g-4 mt-3">
          {(products.length > 0 && !isLoading) ? (
            products.map((product) => (
              <div
                key={product.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <ProductCard {...product} />
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-search fs-1 text-muted"></i>
                </div>
                <h4 className="text-muted">Nessun prodotto trovato</h4>
                <p className="text-muted">
                  Prova a modificare i filtri di ricerca
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    : <div className="text-center m-5">
      <h2>Caricamento Prodotti in Corso...</h2>
    </div>
  )
}
