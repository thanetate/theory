import "./AccountPage.css";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { PromoBar } from "../../components/PromoBar/PromoBar";
import { sessionIdAtom } from "../../atoms/userAtom";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAtom, useSetAtom } from "jotai";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import emailjs from '@emailjs/browser';

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_KEY
);

export function AccountPage() {
	const [session, setSession] = useState<Session | null>(null);
	const [sessionId, setSessionId] = useAtom(sessionIdAtom);
	const resetSessionId = useSetAtom(sessionIdAtom);
	const [searchParams] = useSearchParams();
	const StripeSessionId = searchParams.get("session_id");
	const [orders, setOrders] = useState<
		{
			id: string;
			description: string;
			quantity: number;
			city: string;
			country: string;
			line1: string;
			line2: string;
			postalCode: string;
			state: string;
			size: string;
		}[]
	>([]);

	type OrdersItem = {
		id: string;
		description: string;
		quantity: number;
		city: string;
		country: string;
		line1: string;
		line2: string;
		postalCode: string;
		state: string;
		size: string;
	};

	type StripeLineItem = {
		id: string;
		description: string;
		quantity: number;
	  };

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setSessionId(session?.user?.id || null);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setSessionId(session?.user?.id || null);
		});

		return () => subscription.unsubscribe();
	}, [setSessionId]);

	useEffect(() => {
		if (sessionId) {
			localStorage.setItem("sessionId", sessionId);
		} else {
			localStorage.removeItem("sessionId");
		}
	}, [sessionId]);

	useEffect(() => {
		if (StripeSessionId) {
			handleStripeGetOrders(StripeSessionId);
			handleGetShippingAddress(StripeSessionId);
		}
	}, [StripeSessionId]);

	useEffect(() => {
		handleFetchOrders();
	}, [sessionId]);

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Error logging out:", error.message);
		}
		setSession(null);
		resetSessionId(null);
	};

	const clearStripeSesssionId = () => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete("session_id");
		const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
		window.history.replaceState({}, "", newUrl);
	};

	const handleStripeGetOrders = async (sessionId: string | null) => {
		try {
			const response = await axios.get("https://theory-web.azurewebsites.net/get-line-items", {
				params: { session_id: sessionId },
			});
	
			const stripeOrderData: StripeLineItem[] = response.data;
	
			if (stripeOrderData.length > 0) {
				const shippingDetails = await handleGetShippingAddress(sessionId);
				const metaDataResponse = await handleGetMetaData(sessionId);
				const metaData = metaDataResponse.metadata;
				//todo: change this
				const size = Object.values(metaData)[0] as string;
	
				const orders: OrdersItem[] = stripeOrderData.map((item) => ({
					id: item.id,
					description: item.description,
					quantity: item.quantity,
					city: shippingDetails.city,
					country: shippingDetails.country,
					line1: shippingDetails.line1,
					line2: shippingDetails.line2,
					postalCode: shippingDetails.postalCode,
					state: shippingDetails.state,
					size: size,
				}));

				await handleAddToOrders(orders);
	
				const templateParams = {
					to_name: shippingDetails.name || "NEW ORDER INCOMING",
					message: `Thank you for your order! Here's a summary:\n\n${orders
						.map(
							(item) =>
								`${item.description} (x${item.quantity}) - Size: ${size}`
						)
						.join("\n")}\n\nShipping to: ${shippingDetails.line1}, ${shippingDetails.city}, ${shippingDetails.state}, ${shippingDetails.postalCode}`,
					user_email: shippingDetails.email || "",
				};
	
				await emailjs.send(
					"!!service_kfoq50k",
					"template_swwqw2j",
					templateParams,
					{ publicKey: "HxCpBxarx2sDssveP" }
				);
	
				await handleDeleteCart();
				clearStripeSesssionId();
				window.location.reload();
			}
		} catch (error) {
			console.error("Error fetching data from Stripe", error);
		}
	};
	
	const handleGetShippingAddress = async (sessionId: string | null) => {
		try {
			const response = await axios.get(
				"https://theory-web.azurewebsites.net/get-shipping-details",
				{
					params: { session_id: sessionId },
				}
			);

			const stripeShippingData = response.data;
			if (stripeShippingData) {
				return stripeShippingData;
			}
		} catch (error) {
			console.error("Error fetching shipping data from Stripe", error);
		}
		return null;
	};

	const handleGetMetaData = async (sessionId: string | null) => {
		try {
			const response = await axios.get(
				"https://theory-web.azurewebsites.net/get-checkout-session-metadata",
				{
					params: { session_id: sessionId },
				}
			);

			const stripeMetaData = response.data;
			if (stripeMetaData) {
				return stripeMetaData;
			}
		} catch (error) {
			console.error("Error fetching metadata from Stripe", error);
		}
	};

	const handleAddToOrders = async (
		orders: OrdersItem[]
	  ) => {
		if (!sessionId) return;
		try {
		  await axios.post(
			`https://theory-web.azurewebsites.net/user/${sessionId}/add-to-orders`,
			orders
		  );
		} catch (error) {
		  console.error("Error posting orders", error);
		}
	  };
	  

	const handleFetchOrders = async () => {
		if (!sessionId) return;
		try {
			const response = await axios.get(
				`https://theory-web.azurewebsites.net/user/${sessionId}/orders`
			);

			const ordersData = response.data;
			setOrders(ordersData);
		} catch (error) {
			console.error("Error fetching orders", error);
		}
	};

	const handleDeleteCart = async () => {
		if (!sessionId) {
			console.error("Session Id not found.");
			return;
		}
		try {
			const response = await axios.delete(
				`https://theory-web.azurewebsites.net/user/${sessionId}/cart`
			);

			const cartData = response.data;
			console.log("Deleted Cart.", cartData);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error("Error deleting cart", error.response?.data);
			} else {
				console.error("Unexpected error deleting cart", error);
			}
		}
	};

	if (!session) {
		return (
			<>
				<PromoBar />
				<Header />
				<div className="auth-container">
					<div className="failure-message">Log In Required</div>
					<Auth
						supabaseClient={supabase}
						appearance={{ theme: ThemeSupa }}
						providers={["google"]}
						// queryParams={{
						// 	access_type: "offline",
						// 	prompt: "consent",
						// 	hd: "domain.com",
						// }}
						// providerScopes={{
						// 	google: "https://www.googleapis.com/auth/calendar.readonly",
						// }}
					/>
				</div>
				<Footer />
			</>
		);
	} else {
		return (
			<>
				<PromoBar />
				<Header />
				<div className="account-container">
					<h1 className="welcome-message">Welcome, {session.user?.email}</h1>

					{orders.length > 0 ? (
						<div className="orders-container">
							<h1>Orders : </h1>
							{orders.map((item, index) => (
								<div key={index} className="order-item">
									<div className="order-item-name">'{item.description} -{item.size}' x{item.quantity}</div>
								</div>
							))}
						</div>
					) : (
						<div className="orders-container">
							<h1>No Orders found.</h1>
						</div>
					)}

					<div className="logout-btn-container">
						<button onClick={handleLogout} className="logout-btn">
							Log out
						</button>
					</div>
				</div>
				<Footer />
			</>
		);
	}
}
