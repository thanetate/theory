import "./Footer.css";
import { useNavigate } from "react-router-dom";

export function Footer() {
	const navigate = useNavigate();

	const handleHomeClick = () => {
		navigate("/");
	};
	const handleCollectionClick = () => {
		navigate("/collections");
	};
	const handleAboutClick = () => {
		navigate("/about");
	};
	const handleAccountClick = () => {
		navigate("/account");
	};
	const handleContactClick = () => {
		navigate("/contact");
	};
	return (
		<>
			<div className="line"></div>
			<footer className="footer">
				<div className="footer-container">
					<div className="dir-container">
						<h1>Directory</h1>
						<button onClick={handleHomeClick}>Home</button>
						<button onClick={handleCollectionClick}>Collections</button>
						<button onClick={handleAboutClick}>About</button>
						<button onClick={handleAccountClick}>Log In / Sign Up</button>
					</div>
					<div className="customer-container">
						<h1>Customer</h1>
						<button onClick={handleAccountClick}>Login</button>
						<button onClick={handleAccountClick}>Register</button>
						<button onClick={handleContactClick}>Return Policy</button>
					</div>
					<div className="contact-container">
						<h1>Contact</h1>
						<h2>
							Please contact{" "}
							<a href="mailto:theoryclimbing@gmail.com">
								<span>theoryclimbing@gmail.com</span>
							</a>{" "}
							for any questions.
						</h2>
					</div>
				</div>
				<div className="socialmedia-container">
					<a href="https://www.instagram.com/theoryclimb/">
						<img src="/icons/instagram.svg" alt="Theory Instagram Icon" />
					</a>
				</div>
			</footer>
			<div className="line"></div>
			<div className="createdby-container">
				<h2>
					Website Designed & Created by <span>Thane Tate</span>
				</h2>
				<h2>Help us improve — report issues <a href="https://github.com/thanetate/Theory-v2/issues">here</a>.</h2>
				<div className="icons-container">
					<a href="https://github.com/thanetate">
						<img src="/icons/github.svg" alt="Theory Github Icon" />
					</a>
					<a href="https://linkedin.com/in/thanetate">
						<img src="/icons/linkedin.svg" alt="Thane Tate LinkedIn Icon" />
					</a>
				</div>
			</div>
			<div className="copyright-container">
				<h2>Copyright © 2025 - All rights reserved by Theory Climbing</h2>
			</div>
		</>
	);
}
