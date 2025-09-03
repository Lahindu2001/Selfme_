import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import "./Home.css";
import Navbar from "../Nav/Navbar";
import Footer from "../Footer/Footer";
import BannerImg1 from "./Home-Images/BannerImg1.jpg";
import BannerImg2 from "./Home-Images/BannerImg2.jpg";
import BannerImg3 from "./Home-Images/BannerImg3.jpg";
import BannerImg4 from "./Home-Images/BannerImg4.jpg";
import BannerImg5 from "./Home-Images/BannerImg5.jpg";
import CusSupport from "./Home-Images/cusSupport.png";
import Quality from "./Home-Images/quality.png";
import Warranty from "./Home-Images/warranty.png";
import PowerSaving from "./Home-Images/powerSaving.png";
import Aboutus_banner from "./Home-Images/Aboutus-banner.jpg";
import kw5Solar from "./Home-Images/5kw solar.png";
import Inverter from "./Home-Images/Inverter.jpg";
import BusinessSolar from "./Home-Images/Business solar.png";
import Battery from "./Home-Images/ProductBattery.jpg";
import Gimage1 from "./Home-Images/G1.jpg";
import Gimage2 from "./Home-Images/G2.jpg";
import Gimage3 from "./Home-Images/G3.jpg";
import Gimage4 from "./Home-Images/G4.jpeg";
import Gimage5 from "./Home-Images/G5.jpeg";
import Gimage6 from "./Home-Images/G6.jpeg";
import Gimage7 from "./Home-Images/G7.jpeg";
import Gimage8 from "./Home-Images/G8.jpeg";
import CTA_image from "./Home-Images/cta-image.jpg";
function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slides = [
    {
      image: BannerImg1,
      title: "Power Your Future with Solar Energy",
      subtitle: "Leading Solar Solutions in Sri Lanka",
      description:
        "Transform your home and business with sustainable solar power systems. Join thousands of satisfied customers who've made the switch to clean, renewable energy.",
      buttonText: "Get Free Quote",
      highlight: "Save up to 80% on electricity bills",
    },
    {
      image: BannerImg2,
      title: "Professional Solar Installation",
      subtitle: "Expert Team • Quality Guarantee",
      description:
        "Our certified engineers provide complete solar panel installation services with 25-year warranty. From residential rooftops to commercial complexes.",
      buttonText: "View Our Work",
      highlight: "1000+ Successful Installations",
    },
    {
      image: BannerImg3,
      title: "Smart Solar Management System",
      subtitle: "Monitor & Control Your Energy",
      description:
        "Advanced ERP system to track your solar energy production, consumption, and savings in real-time. Optimize your energy usage with intelligent analytics.",
      buttonText: "Learn More",
      highlight: "Real-time Energy Monitoring",
    },
    {
      image: BannerImg4,
      title: "Eco-Friendly Energy Solutions",
      subtitle: "For a Sustainable Tomorrow",
      description:
        "Reduce your carbon footprint while saving money. Our premium solar panels are designed to withstand Sri Lankan weather conditions for decades.",
      buttonText: "Calculate Savings",
      highlight: "25+ Years Lifespan Guarantee",
    },
    {
      image: BannerImg5,
      title: "Complete Solar Packages",
      subtitle: "Affordable • Reliable • Efficient",
      description:
        "Choose from our range of solar packages designed for homes, businesses, and industries. Flexible payment plans and government subsidies available.",
      buttonText: "View Packages",
      highlight: "Starting from Rs. 150,000",
    },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Customer Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to Solar ERP Customer Panel</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div
        id="default-carousel"
        className="relative w-full"
        data-carousel="slide"
      >
        <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`banner-slide duration-700 ease-in-out ${
                index === currentSlide ? "active" : "hidden"
              }`}
              data-carousel-item
            >
              <img
                src={slide.image}
                className="absolute block w-full h-full object-cover"
                alt={`Selfme.lk Solar - ${slide.title}`}
              />
              <div className="banner-overlay">
                <div className="banner-content">
                  <div className="content-wrapper">
                    <h1 className="banner-title">{slide.title}</h1>
                    <h2 className="banner-subtitle">{slide.subtitle}</h2>
                    <p className="banner-description">{slide.description}</p>
                    <div className="highlight-badge">
                      <span className="highlight-text">
                        ✨ {slide.highlight}
                      </span>
                    </div>
                    <div className="banner-actions">
                      <button className="cta-button primary">
                        {slide.buttonText}
                      </button>
                      <button className="cta-button secondary">
                        Contact Us
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <h2 className="after-heading-choose-us">Why Choose Us</h2>
      <div className="service-box-section">
        <div className="service-box">
          <img src={Warranty} alt="Warranty Icon" />
          <h2>Trust & Warranty</h2>
          <p>
            Our products come with comprehensive warranties to ensure your peace
            of mind and long-term satisfaction with your solar investment.
          </p>
        </div>
        <div className="service-box">
          <img src={Quality} alt="Quality Icon" />
          <h2>High Quality Work</h2>
          <p>
            We use only premium materials and follow industry best practices to
            deliver solar solutions that stand the test of time.
          </p>
        </div>
        <div className="service-box">
          <img src={PowerSaving} alt="Customer Support Icon" />
          <h2>Power Saving</h2>
          <p>
            Our dedicated support team is available round the clock to address
            any questions or concerns about your solar system.
          </p>
        </div>
        <div className="service-box">
          <img src={CusSupport} alt="Customer Support Icon" />
          <h2>24/7 Support</h2>
          <p>
            Our dedicated support team is available round the clock to address
            any questions or concerns about your solar system.
          </p>
        </div>
      </div>
      <div className="about-us">
        <h2 className="section-title">About Selfme.lk</h2>
        <div className="about-us-main">
          <div className="about-us-image">
            <img src={Aboutus_banner} alt="About Selfme.lk solar solutions" />
          </div>
          <div className="about-us-content">
            <p className="about-text">
              Selfme.lk is a leading solar energy solutions provider in Sri
              Lanka, dedicated to delivering sustainable and cost-effective
              renewable energy solutions. With years of experience in the
              industry, we specialize in high-quality solar panel installations,
              energy storage systems, and comprehensive maintenance services.
              <br></br>
              Our strategic collaborations with industry leaders like Kelani
              Cables guarantee superior wiring solutions that meet international
              safety standards, while our certified partnership with CEB (Ceylon
              Electricity Board) ensures seamless grid integration for all our
              installations.
            </p>
            <div className="button-group">
              <button className="primary-btn">View Products</button>
              <button className="secondary-btn">Contact us</button>
            </div>
          </div>
        </div>
      </div>
      <div className="Products">
        <h2>Our Product Categories</h2>
        <div className="Product-section">
          <div className="products-category">
            <img src={kw5Solar} alt="temp solar" />
            <h3>5KW Home Solar System</h3>
            <p>Perfect for houses, save 70% bill</p>
            <button>View Details</button>
          </div>
          <div className="products-category">
            <img src={BusinessSolar} alt="" />
            <h3>20KW Business Package</h3>
            <p>Best for small businesses</p>
            <button>View Details</button>
          </div>
          <div className="products-category">
            <img src={Battery} alt="" />
            <h3>Lithium-ion Battery Pack</h3>
            <p>Long lifespan, maintenance free</p>
            <button>View Details</button>
          </div>
          <div className="products-category">
            <img src={Inverter} alt="" />
            <h3>Hybrid Inverter</h3>
            <p>Smart switching between solar & grid</p>
            <button>View Details</button>
          </div>
        </div>
        <button className="allProducts-btn">View All Products</button>
      </div>
      <h2 className="after-heading-choose-us">Our testimonials</h2>
      <div className="testimonial-section">
        <div className="testimonial">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Customer"
          />
          <div className="rating">
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
          </div>
          <h4>Jake Gyllenhaal</h4>
          <p>
            "The solar installation was seamless and the energy savings are
            incredible!"
          </p>
        </div>
        <div className="testimonial">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Customer"
          />
          <div className="rating">
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
          </div>
          <h4>Sarah Johnson</h4>
          <p>
            "Excellent service and professional team. My electricity bill
            dropped by 70%!"
          </p>
        </div>
        <div className="testimonial">
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="Customer"
          />
          <div className="rating">
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
          </div>
          <h4>Michael Chen</h4>
          <p>
            "The system works perfectly even during power outages. Highly
            recommend!"
          </p>
        </div>
        <div className="testimonial">
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="Customer"
          />
          <div className="rating">
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
            <span className="star">★</span>
          </div>
          <h4>Emily Rodriguez</h4>
          <p>
            "The installation was quick and the team was very knowledgeable."
          </p>
        </div>
      </div>
      <div className="gallery-section">
        <h1>Our Gallery</h1>
        <div className="gallery-grid">
          <div className="gallery-item">
            <img src={Gimage1} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage2} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage3} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage4} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage5} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage6} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage7} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
          <div className="gallery-item">
            <img src={Gimage8} alt="Solar installation project" />
            <div className="image-overlay"></div>
          </div>
        </div>
      </div>
      <div className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Power Your Future with Solar Energy?</h2>
            <p>
              Join hundreds of satisfied customers who are saving money and
              reducing their carbon footprint with our premium solar solutions.
            </p>
            <div className="cta-buttons">
              <button className="cta-primary">Get a Free Quote</button>
              <button className="cta-secondary">Learn More</button>
            </div>
          </div>
          <div className="cta-image">
            <img src={CTA_image} alt="" />
          </div>
        </div>
      </div>
      <div className="ourTeam-section">
        <h2>Our Team</h2>
        <div className="team-container">
          <div className="team-member">
            <img
              src="https://randomuser.me/api/portraits/women/32.jpg"
              alt="Sameera Dharmasiri"
            />
            <h4>Sameera Dharmasiri</h4>
            <p className="position">CEO & Founder</p>
            <p className="bio">
              15+ years in renewable energy. Founded Selfme.lk to bring
              affordable solar solutions to Sri Lankan homes and businesses.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          <div className="team-member">
            <img
              src="https://randomuser.me/api/portraits/men/45.jpg"
              alt="Rajith Perera"
            />
            <h4>Rajith Perera</h4>
            <p className="position">Solar Engineer</p>
            <p className="bio">
              Certified solar specialist with 8 years experience. Designs
              efficient systems tailored to Sri Lanka's climate.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          <div className="team-member">
            <img
              src="https://randomuser.me/api/portraits/women/68.jpg"
              alt="Nayana Silva"
            />
            <h4>Nayana Silva</h4>
            <p className="position">Installation Manager</p>
            <p className="bio">
              Leads our installation teams with 10 years of field experience.
              Ensures flawless implementation of every project.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          <div className="team-member">
            <img
              src="https://randomuser.me/api/portraits/men/22.jpg"
              alt="Dinesh Fernando"
            />
            <h4>Dinesh Fernando</h4>
            <p className="position">Customer Support</p>
            <p className="bio">
              5+ years in customer care. Provides ongoing support and
              maintenance guidance for all solar system owners.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Home;