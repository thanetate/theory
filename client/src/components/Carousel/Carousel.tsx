import Slider from "react-slick";
import { useRef } from "react";
import "./Carousel.css";

const images = [
	"./Cropped_CRIMP.png",
	"./Carousel2.png",
	// "./Carousel6.png",
	// "./Carousel4.png",
];

export function Carousel() {
	const sliderRef = useRef<Slider>(null);

	const settings = {
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
	};

	const handlePrevClick = () => {
		if (sliderRef.current) {
			sliderRef.current.slickPrev();
		}
	};

	const handleNextClick = () => {
		if (sliderRef.current) {
			sliderRef.current.slickNext();
		}
	};

	return (
		<div className="carousel-outter-container">
			<div className="slider-container">
				<Slider ref={sliderRef} {...settings}>
					{images.map((image, index) => (
						<div key={index} className="carousel-img">
							<img src={image} alt={`Carousel ${index}`} />
						</div>
					))}
				</Slider>
				<div className="carousel-btn-container">
					<button className="carousel-btn" onClick={handlePrevClick}>
						<img src="/icons/leftarrow.svg" alt="Left Arrow" />
					</button>
					<button className="carousel-btn" onClick={handleNextClick}>
						<img src="/icons/rightarrow.svg" alt="Right Arrow" />
					</button>
				</div>
			</div>
		</div>
	);
}