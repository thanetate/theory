import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { PromoBar } from "../../components/PromoBar/PromoBar";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { productAtom } from "../../atoms/productAtom";
import { fetchProductsAtom } from "../../atoms/productAtom";
import { useEffect, useState } from "react";
import "./CollectionsPage.css";
import { Loading } from "../../components/Loading/Loading";

export function CollectionsPage() {
	const [products] = useAtom(productAtom);
	const [, fetchProducts] = useAtom(fetchProductsAtom);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		fetchProducts();
		setLoading(false);
	}, [fetchProducts]);

	const navigate = useNavigate();

	const handleProductClick = (productId: number) => {
		navigate(`/collections/${productId}`);
	};

	if (loading) {
		return (
			<>
				<PromoBar />
				<Header />
				<Loading />
				<Footer />
			</>
		);
	}
	return (
		<>
			<PromoBar />
			<Header />
			<div className="collections-header">
				<div className="num-of-products">
					{Array.isArray(products) ? products.length : 0} products
				</div>
			</div>
			<div className="collections-main">
				<div className="product-container">
					<div className="product-img-container">
						{Array.isArray(products) &&
							products.map((product, index) => (
								<div
									key={index}
									className="product-card"
									onClick={() => handleProductClick(product.id)}
								>
									<img src={product.image} className="product-img" />
									<div className="product-price">${product.price}.00</div>
								</div>
							))}
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
