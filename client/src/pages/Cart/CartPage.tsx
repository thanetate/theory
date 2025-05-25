import "./CartPage.css";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PromoBar } from "../../components/PromoBar/PromoBar";
import { sessionIdAtom } from "../../atoms/userAtom";
import { fetchCartDetailsAtom } from "../../atoms/cartAtom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAtom } from "jotai";

export function CartPage() {
	const [sessionId] = useAtom(sessionIdAtom);
	const [cartDetails, fetchCartDetails] = useAtom(fetchCartDetailsAtom);
	const navigate = useNavigate();

	useEffect(() => {
		fetchCartDetails();
	}, [fetchCartDetails]);

	const handleGoShopping = () => {
		navigate("/collections");
	};

	const handleRemoveFromCart = async (productId: number) => {
		try {
			const response = await fetch(
				`http://localhost:5255/user/${sessionId}/cart/${productId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to remove product from cart");
			}
			toast.success("Removed from cart");
			fetchCartDetails();
		} catch (error) {
			toast.error("Failed to remove product from cart");
			console.error("Failed to remove product from cart:", error);
		}
	};

	const handleUpdateQuantity = async (
		productId: number,
		newQuantity: number
	) => {
		try {
			const response = await fetch(
				`http://localhost:5255/user/${sessionId}/cart/${productId}/quantity/${newQuantity}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update product quantity");
			}

			toast.success("Cart updated");
			fetchCartDetails(); // refresh cart state
		} catch (error) {
			toast.error("Failed to update cart");
			console.error("Update cart error:", error);
		}
	};

	const handleCheckout = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const response = await axios.post(
				"http://localhost:5255/create-checkout-session",
				{ cart: cartDetails },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			// redirect to stripe checkout page
			if (response.data.url) {
				window.location.href = response.data.url;
			} else {
				console.error("Checkout session URL not found in response.");
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
		}
	};

	return (
		<>
			<PromoBar />
			<Header />
			<div className="cart-page">
				{cartDetails && cartDetails.length > 0 ? (
					<div>
						<ul>
							{cartDetails.map((item, index) => (
								<li key={index} className="cart-item">
									<div className="item-img-container">
										<img src={item.image} alt="Image" className="item-img" />
									</div>
									<div className="item-content">
										<p className="item-name">{item.name}</p>
										<p className="item-price">${item.price}</p>
										<p className="item-size">Size: {item.size}</p>
										<div className="quantity">
											<div className="quantity-box">
												<button
													onClick={() =>
														handleUpdateQuantity(
															item.id,
															Math.max(1, item.quantity - 1)
														)
													}
												>
													-
												</button>
												<input
													type="text"
													value={item.quantity}
													readOnly
													className="quantity-input"
												/>
												<button
													onClick={() =>
														handleUpdateQuantity(item.id, item.quantity + 1)
													}
												>
													+
												</button>
											</div>
										</div>

										<button
											onClick={() => handleRemoveFromCart(item.id)}
											className="remove-btn"
										>
											Remove Item
										</button>
									</div>
								</li>
							))}
						</ul>
						<div className="checkout-container">
							<form onSubmit={handleCheckout}>
								<button className="checkout" type="submit">
									Checkout
								</button>
							</form>
						</div>
					</div>
				) : (
					<div className="go-shopping-container">
						<h1>Your cart is empty.</h1>
						<button className="go-shopping" onClick={handleGoShopping}>
							Go Shopping
						</button>
					</div>
				)}
			</div>
			<Footer />
		</>
	);
}
