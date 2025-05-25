import "./CartPage.css";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PromoBar } from "../../components/PromoBar/PromoBar";
import { sessionIdAtom } from "../../atoms/userAtom";
import { fetchCartDetailsAtom } from "../../atoms/cartAtom";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
	handleRemoveFromCart,
	handleUpdateQuantity,
	handleCheckout,
} from "../../services/cart.service";

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

	if (!sessionId) {
		toast.error("You must be logged in to perform this action.");
		return;
	}

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
															sessionId,
															item.id,
															Math.max(1, item.quantity - 1),
															fetchCartDetails
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
														handleUpdateQuantity(
															sessionId,
															item.id,
															item.quantity + 1,
															fetchCartDetails
														)
													}
												>
													+
												</button>
											</div>
										</div>

										<button
											onClick={() =>
												handleRemoveFromCart(
													sessionId,
													item.id,
													fetchCartDetails
												)
											}
											className="remove-btn"
										>
											Remove Item
										</button>
									</div>
								</li>
							))}
						</ul>
						<div className="checkout-container">
							<form onSubmit={(e) => handleCheckout(e, cartDetails)}>
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
