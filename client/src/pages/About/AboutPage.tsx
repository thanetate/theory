import "./AboutPage.css";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { PromoBar } from "../../components/PromoBar/PromoBar";

export function AboutPage() {
	return (
		<>
			<PromoBar />
			<Header />
			<div className="about-page">
				<div className="aboutpage-img-container">
					<img
						src="./Carousel1.png"
						alt="About Us Image"
						className="aboutpage-img"
					/>
				</div>
				<div className="aboutpage-desc-container">
					<h1 className="aboutpage-desc">
						Theory is a climbing brand built by three friends from the DFW area
						who share a deep love for the sport. Our mission is simple: to
						create clothing we want to wear. Designed to be functional, minimal,
						and modern, our pieces are made to support your adventures on and
						off the wall. We started Theory to bring thoughtful design to
						climbing apparel and to share it with the community that has
						inspired us. <br /> <br />
						Thank you for supporting our journey. If you’d like to connect,
						share your ideas, or just say hello, reach out to us on Instagram or
						via email! <br /> <br />– The Theory Team
					</h1>
				</div>
			</div>
			<Footer />
		</>
	);
}
