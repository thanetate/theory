import { useNavigate } from "react-router-dom";
import "./Shop.css";

const shopCards = [
	{
		image: "./CRIMPS.jpg",
		title: "Summer 2026",
	},
	{
		image: "./Carousel1.png",
		title: "All Drops",
	},
	// {
	// 	image: "./Carousel1.png",
	// 	title: "TITLE",
	// },
	// {
	// 	image: "./Carousel2.png",
	// 	title: "TITLE",
	// },
];

export function Shop() {
	const navigation = useNavigate();

	const handleShopClick = () => {
		navigation("/collections");
	};

	return (
		<>
			<div className="shop-container">
				<h1>SHOP NOW</h1>
				<div className="shop-card-container">
					{shopCards.map((card, index) => (
						<div key={index} className="shop-card">
							<img src={card.image} />
							<h2>{card.title}</h2>
							<button onClick={handleShopClick}>Shop</button>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
