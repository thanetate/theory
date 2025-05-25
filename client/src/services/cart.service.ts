import toast from "react-hot-toast";
import axios from "axios";

type CartItem = {
	id: number;
	name: string;
	description: string;
	image: string;
	price: number;
	size: string;
	quantity: number;
};

export const handleRemoveFromCart = async (
	sessionId: string,
	productId: number,
	fetchCartDetails: () => void
) => {
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

export const handleUpdateQuantity = async (
    sessionId: string,
	productId: number,
	newQuantity: number,
    fetchCartDetails: () => void
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

export const handleCheckout = async (event: React.FormEvent, cartDetails: CartItem[]) => {
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
