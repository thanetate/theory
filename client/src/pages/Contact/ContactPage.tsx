import "./ContactPage.css";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { PromoBar } from "../../components/PromoBar/PromoBar";

export function ContactPage() {
	return (
		<>
			<PromoBar />
			<Header />
			<div className="contact-page">
				<h1>
					We are here to help you. If you have any questions, feel free to
					contact us at <a href="mailto:theoryclimbing@gmail.com"><span>theoryclimbing@gmail.com</span></a>
				</h1>
			</div>
			<Footer />
		</>
	);
}
