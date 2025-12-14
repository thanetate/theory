// not working yet
import axios from "axios";

export const handleStripeGetOrders = async (sessionId: string | null, clearStripeSesssionId: () => void, reloadPage: () => void) => {
    try {
        const response = await axios.get("https://theory-webapp.azurewebsites.net/get-line-items", {
            params: { session_id: sessionId },
        });

        if(!sessionId) {
            console.error("No session Id found.");
            return;
        }

        const stripeOrderData = response.data;
        if (stripeOrderData) {
            const shippingDetails = await handleGetShippingAddress(sessionId);
            const metaDataResponse = await handleGetMetaData(sessionId);
            const metaData = metaDataResponse.metadata;

            for (const item of stripeOrderData) {
                const size = metaData[item.description];

                await handleAddToOrders(
                    sessionId,
                    item.id,
                    item.description,
                    item.quantity,
                    shippingDetails.city,
                    shippingDetails.country,
                    shippingDetails.line1,
                    shippingDetails.line2,
                    shippingDetails.postalCode,
                    shippingDetails.state,
                    size
                );
                await handleDeleteCart(sessionId);
                clearStripeSesssionId();
                reloadPage();
            }
        }
    } catch (error) {
        console.error("Error fetching data from Stripe", error);
    }
};

export const handleGetShippingAddress = async (sessionId: string | null) => {
		try {
			const response = await axios.get(
				"https://theory-webapp.azurewebsites.net/get-shipping-details",
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
            "https://theory-webapp.azurewebsites.net/get-checkout-session-metadata",
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
    sessionId: string,
    id: string,
    description: string,
    quantity: number,
    city: string,
    country: string,
    line1: string,
    line2: string,
    postalCode: string,
    state: string,
    size: string
) => {
    if (!sessionId) return;
    try {
        const response = await axios.post(
            `https://theory-webapp.azurewebsites.net/user/${sessionId}/add-to-orders`,
            {
                id: id,
                description: description,
                quantity: quantity,
                city: city,
                country: country,
                line1: line1,
                line2: line2,
                postalCode: postalCode,
                state: state,
                size: size,
            }
        );
        const orderData = response.data;
        console.log("Order Data: ", orderData);
    } catch (error) {
        console.error("Error posting orders", error);
    }
};

const handleDeleteCart = async (sessionId: string) => {
    if (!sessionId) {
        console.error("Session Id not found.");
        return;
    }
    try {
        const response = await axios.delete(
            `https://theory-webapp.azurewebsites.net/user/${sessionId}/cart`
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

export const handleFetchOrders = async (sessionId: string) => {
    if (!sessionId) return;
    try {
        const response = await axios.get(
            `https://theory-webapp.azurewebsites.net/user/${sessionId}/orders`
        );

        const ordersData = response.data;
        console.log("Order Data: ", ordersData);
        return ordersData;
        // setOrders(ordersData);
    } catch (error) {
        console.error("Error fetching orders", error);
    }
};