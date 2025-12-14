import axios from "axios";
import { atom } from "jotai";

export interface Product {
	id: number;
	name: string;
	description: string;
	image: string;
	price: number;
}

// atom to store data into
export const productAtom = atom<Product[]>([]);
export const singleProductAtom = atom<Product | null>(null);

// atom to fetch all products
export const fetchProductsAtom = atom(
	(get) => get(productAtom),
	async (_, set) => {
		console.log("fetchProducts called");
		try {
			const response = await axios.get(`https://theory-webapp.azurewebsites.net/products`);
			const productData = response.data;
			set(productAtom, productData);
			console.log("All Products Data (Atom):", productData);
		} catch (error) {
			console.error("Error fetching products", error);
		}
	}
);

// atom to fetch product by id
export const fetchProductById = atom(
	(get) => get(singleProductAtom),
	async (_, set, { productId }) => {
		try {
			const response = await axios.get(
				`https://theory-webapp.azurewebsites.net/products/${productId}`
			);
			const productData = response.data;
			set(singleProductAtom, productData);
			console.log("Product Data (Atom):", productData);
		} catch (error) {
			console.error("Error fetching product", error);
		}
	}
);
