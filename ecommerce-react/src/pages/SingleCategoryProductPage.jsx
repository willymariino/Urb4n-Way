import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard.jsx";

export default function SingleCategoryProductPage() {
  const { categorySlug } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);

  function getProducts() {
    const endPoint = `${import.meta.env.VITE_API_URL}/products/category/${categorySlug}`; axios
      .get(endPoint)
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const categoryNames = {
    "polo-&-t-shirt": "Polo & t-Shirt",
    capispalla: "Capispalla",
    felpe: "Felpe",
    pantaloni: "Pantaloni",
    scarpe: "Scarpe",
    streetwear: "Streetwear",
  };

  const categoryName = categoryNames[categorySlug] || "Categoria non trovata";

  useEffect(() => {
    getProducts();
  }, [categorySlug]);

  return (
    <div className="container mb-3">
      <div className="row">
        <div className="col-12">
          <h1 className="mt-3">{categoryName}</h1>
          <p>
            {" "}
            Eleganza, comfort e qualità in ogni dettaglio, Scopri la nostra
            selezione esclusiva di capi pensati per accompagnarti in ogni
            momento della giornata. Dal casual all’elegante, ogni prodotto è
            realizzato con materiali di alta qualità per offrirti il massimo
            dello stile e della comodità. Scegli ciò che meglio esprime la tua
            personalità e rendi unico il tuo look con le ultime tendenze della
            moda{" "}
          </p>

          <hr />

          <h1 className="mt-5">Prodotti - {categoryName}</h1>

          <div>
            <div className="row g-4 mt-4">
              {products.map((product) => (
                <div className="col-12  col-md-6 col-lg-4" key={product.slug}>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
