import { sessionIdAtom } from "./userAtom";
import { atom } from "jotai";
import axios from "axios";

export const cartDetailsAtom = atom<Array<{
	id: number;
	name: string;
	description: string;
	image: string;
	price: number;
	size: string;
	quantity: number;
}> | null>(null);
interface Product {
	id: number;
	description: string;
	name: string;
	price: number;
	image: string;
}

export const fetchCartDetailsAtom = atom(
	(get) => get(cartDetailsAtom),
	async (get, set) => {
		const sessionId = get(sessionIdAtom);
		if (!sessionId) return;

		try {
			const response = await axios.get(
				`http://localhost:5255/user/${sessionId}/cart`,
				{
					headers: {
						Accept: "application/json",
					},
				}
			);
			const cartDetails = response.data;
			set(cartDetailsAtom, cartDetails);
			console.log("DETAILS", cartDetails);
		} catch (error) {
			console.error("Failed to fetch cart details:", error);
		}
	}
);

export const addToCartAtom = atom(
	(get) => async (product: Product, quantity: number, size: string) => {
		const sessionId = get(sessionIdAtom);
		if (!product || !sessionId) return;

		// Todo: Find a safer way of creating a uid.
		// for now, I created a random number with around a billion possible
		// unique values.
		const min = 1;
		const max = 999999999;
		const randomNumber = Math.floor(Math.random() * (max - min)) + min;

		try {
			const response = await axios.post(
				`http://localhost:5255/user/${sessionId}/add-to-cart`,
				{
					id: randomNumber,
					description: product.description,
					name: product.name,
					price: product.price,
					quantity: quantity,
					size: size,
					image: product.image,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status !== 200) {
				throw new Error("Failed to add product to cart");
			}
		} catch (error) {
			console.error("Failed to add product to cart:", error);
		}
	}
);