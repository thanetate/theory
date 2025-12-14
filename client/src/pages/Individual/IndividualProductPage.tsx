import "./IndividualProductPage.css";
import "../../components/Carousel/Carousel.css";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PromoBar } from "../../components/PromoBar/PromoBar";
import { singleProductAtom } from "../../atoms/productAtom";
import { fetchProductById } from "../../atoms/productAtom";
import { sessionIdAtom } from "../../atoms/userAtom";
import { addToCartAtom } from "../../atoms/cartAtom";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAtom } from "jotai";

export function IndividualProductPage() {
	const [, fetchProduct] = useAtom(fetchProductById);
	const [product] = useAtom(singleProductAtom);
	const [addToCart] = useAtom(addToCartAtom);
	const [sessionId] = useAtom(sessionIdAtom);
	const [size, setSize] = useState("small");
	const [quantity, setQuantity] = useState(1);
	const [displayPrice, setDisplayPrice] = useState<number | null>(null);
	const { productId } = useParams<{ productId: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (product) {
			setDisplayPrice(product.price);
		}
	}, [product]);

	useEffect(() => {
		if (productId) {
			fetchProduct({ productId: Number(productId) });
		}
	}, [fetchProduct, productId]);

	const handleQuantityChange = (amount: number) => {
		setQuantity((prevQuantity) => Math.max(1, prevQuantity + amount));
	};

	const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedSize = event.target.value;
		setSize(selectedSize);

		if (product) {
			// Adjust the price based on size
			if (selectedSize === "large") {
				setDisplayPrice(product.price + 10); 
			} else {
				setDisplayPrice(product.price);
			}
		}
	};

	const handleAddToCart = () => {
		if (!sessionId) {
			navigate("/account");
		} else {
			if (product) {
				const updatedProduct = { ...product };

				if (size === "large") {
					updatedProduct.price = product.price + 10;
				}
				console.log('product quantity', quantity);
				toast.success("Added to cart");
				addToCart(updatedProduct, quantity, size);
			}
		}
	};

	if (!product) {
		return (
			<>
				<div className="spinner-container">
					{/* Todo: add spinner effect  */}
				</div>
			</>
		);
	}

	return (
		<>
			<PromoBar />
			<Header />
			<div className="product-page-container">
				<div className="leftside">
					<div className="i-product-img-container">
						<img
							src={product.image}
							alt="Product Image"
							className="i-product-img"
						/>
					</div>
				</div>
				<div className="rightside">
					<div className="i-product-info">
						<h1>{product.name}</h1>
						<h3 className="price">
							$
							{displayPrice !== null
								? displayPrice.toFixed(2)
								: product.price.toFixed(2)}{" "}
							USD
						</h3>
						<p>{product.description}</p>
						<p> Shipping calculated at checkout.</p>
						<div className="size">
							<h2>Size</h2>
							<select
								name="size"
								className="size-container"
								onChange={handleSizeChange}
							>
								{/* <option value="x-small">X-Small</option> */}
								<option value="small">12" x 15"</option>
								{/* <option value="medium">Medium</option> */}
								<option value="large">16" x 20"</option>
								{/* <option value="x-large">X-Large</option> */}
							</select>
						</div>
						<div className="quantity">
							<h2>Quantity</h2>
							<div className="quantity-box">
								<button onClick={() => handleQuantityChange(-1)}>-</button>
								<input
									type="text"
									value={quantity}
									readOnly
									className="quantity-input"
								/>
								<button onClick={() => handleQuantityChange(1)}>+</button>
							</div>
						</div>
						<div className="checkout">
							<button onClick={handleAddToCart}>Add to cart</button>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
