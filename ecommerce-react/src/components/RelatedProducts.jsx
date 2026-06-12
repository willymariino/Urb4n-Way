import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RelatedProducts = ({ category_slug }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/products/category/${category_slug}`)
            .then((res) => {
                setRelatedProducts(res.data.products.splice(0, 6))
            })
            .catch((error) => {
                console.error("Errore nel recupero dei prodotti correlati:", error);
            });
    }, [category_slug]);

    return (
        <div className="container mt-5">
            <h3 className="fw-bold">Prodotti correlati</h3>
            <div className="row">
                {relatedProducts.map((product) => (
                    <div key={product.id} className="col-md-4">
                        <div className="card shadow-sm mt-4">
                            <img
                                src={product.image_url}
                                className="card-img-top"
                                alt={product.name}
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body text-center">
                                <h5 className="card-title">{product.name}</h5>
                                <p className="text-success fw-bold">€{product.price}</p>
                                <Link to={`/products/${product.slug}`} className="btn btn-primary">
                                    Vedi prodotto
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;