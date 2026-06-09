import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const productData = [
  { price: '$12,500', desc: 'Tourbillon Héritage – a masterpiece of precision engineering with an open-worked dial.' },
  { price: '$9,800', desc: 'Chronograph Orfèvre – flyback chronograph with hand-guilloché dial.' },
  { price: '$14,200', desc: 'Moonphase Élégance – astronomical moonphase with perpetual calendar.' },
  { price: '$27,000', desc: 'Skeleton Millésime – fully skeletonized movement with engraved bridges.' },
];

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ image: '', title: '', price: '$0', desc: '' });
  const [activeToggle, setActiveToggle] = useState('personal');
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(true);

  const trackRef = useRef(null);
  const floatingCardsRef = useRef(null);
  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const stepRef = useRef(270);
  const cardGapRef = useRef(10);
  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartOffsetRef = useRef(0);

  const updateDimensions = useCallback(() => {
    const track = trackRef.current;
    const container = floatingCardsRef.current;
    if (!track || !container) return 270;

    const cards = track.querySelectorAll('.mini-card');
    if (cards.length === 0) return 270;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const computedGap = parseFloat(getComputedStyle(track).gap) || cardGapRef.current;
    cardGapRef.current = computedGap;
    const step = cardWidth + computedGap;
    stepRef.current = step;

    const containerWidth = container.clientWidth;
    const totalTrackWidth = cards.length * cardWidth + (cards.length - 1) * computedGap;
    const maxOffset = Math.max(0, totalTrackWidth - containerWidth);
    maxOffsetRef.current = maxOffset;

    if (offsetRef.current > maxOffset) {
      offsetRef.current = maxOffset;
    }
    return step;
  }, []);

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translateX(-${offsetRef.current}px)`;
    setPrevDisabled(offsetRef.current >= maxOffsetRef.current);
    setNextDisabled(offsetRef.current <= 0);
  }, []);

  const handleNext = useCallback(() => {
    updateDimensions();
    const step = stepRef.current;
    if (offsetRef.current > 0) {
      offsetRef.current = Math.max(offsetRef.current - step, 0);
      updatePosition();
    }
  }, [updateDimensions, updatePosition]);

  const handlePrev = useCallback(() => {
    updateDimensions();
    const step = stepRef.current;
    const maxOff = maxOffsetRef.current;
    if (offsetRef.current < maxOff) {
      offsetRef.current = Math.min(offsetRef.current + step, maxOff);
      updatePosition();
    }
  }, [updateDimensions, updatePosition]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = 'none';
    offsetRef.current = 0;
    updateDimensions();
    updatePosition();

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transition = 'transform 1.2s ease';
        const step = updateDimensions();
        const maxOff = maxOffsetRef.current;
        offsetRef.current = Math.min(step * 5, maxOff);
        updatePosition();
      });
    });

    const handleResize = () => {
      updateDimensions();
      updatePosition();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateDimensions, updatePosition]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartOffsetRef.current = offsetRef.current;
      isDraggingRef.current = true;
      track.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = touchStartXRef.current - e.touches[0].clientX;
      let newOffset = touchStartOffsetRef.current + deltaX;
      newOffset = Math.max(0, Math.min(newOffset, maxOffsetRef.current));
      offsetRef.current = newOffset;
      track.style.transform = `translateX(-${offsetRef.current}px)`;
      setPrevDisabled(offsetRef.current >= maxOffsetRef.current);
      setNextDisabled(offsetRef.current <= 0);
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      track.style.transition = 'transform 0.5s ease';
      const step = updateDimensions();
      const snappedOffset = Math.round(offsetRef.current / step) * step;
      offsetRef.current = Math.max(0, Math.min(snappedOffset, maxOffsetRef.current));
      updatePosition();
    };

    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: true });
    track.addEventListener('touchend', handleTouchEnd);

    return () => {
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
      track.removeEventListener('touchend', handleTouchEnd);
    };
  }, [updateDimensions, updatePosition]);

  const openModal = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.mini-card');
    const card = cards[index];
    if (!card) return;
    const img = card.querySelector('img');
    const alt = img?.alt || 'Timepiece';
    const data = productData[index % productData.length];

    setModalData({
      image: img?.src || '',
      title: alt,
      price: data?.price || '$0',
      desc: data?.desc || 'Exclusive handmade timepiece.',
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleToggle = useCallback((option) => {
    setActiveToggle(option);
  }, []);

  return (
    <>
      <section className="yes">
        <div className="header">
          <div className="nav-left">
            <span className="pill active">Maison</span>
            <span className="pill">Collections</span>
            <span className="pill">Savoir‑Faire</span>
            <span className="pill">Boutique</span>
          </div>
          <button className="cta">Discover the Atelier</button>
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
        <div className={`mobile-nav${mobileMenuOpen ? ' show-menu' : ''}`}>
          <a href="#">Maison</a>
          <a href="#">Collections</a>
          <a href="#">Savoir‑Faire</a>
          <a href="#">Boutique</a>
        </div>

        <div className="main">
          <div className="floating-cards" ref={floatingCardsRef}>
            <button
              className={`floating-arrow left${prevDisabled ? ' disabled' : ''}`}
              onClick={handlePrev}
              aria-label="Previous cards"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="cards-track" ref={trackRef}>
              <div className="mini-card">
                <img src="img/1.png" alt="Tourbillon Héritage" />
                <button className="btn" onClick={() => openModal(0)}>View timepiece</button>
              </div>
              <div className="mini-card">
                <img src="img/4.png" alt="Chronograph Orfèvre" />
                <button className="btn" onClick={() => openModal(1)}>View timepiece</button>
              </div>
              <div className="mini-card">
                <img src="img/5.png" alt="Moonphase Élégance" />
                <button className="btn" onClick={() => openModal(2)}>View timepiece</button>
              </div>
              <div className="mini-card large">
                <img src="img/3.png" alt="Skeleton Millésime" />
                <button className="btn" onClick={() => openModal(3)}>View timepiece</button>
              </div>
              <div className="mini-card">
                <img src="img/1.png" alt="Tourbillon Héritage" />
                <button className="btn" onClick={() => openModal(4)}>View timepiece</button>
              </div>
              <div className="mini-card">
                <img src="img/4.png" alt="Chronograph Orfèvre" />
                <button className="btn" onClick={() => openModal(5)}>View timepiece</button>
              </div>
              <div className="mini-card">
                <img src="img/5.png" alt="Moonphase Élégance" />
                <button className="btn" onClick={() => openModal(6)}>View timepiece</button>
              </div>
              <div className="mini-card large">
                <img src="img/3.png" alt="Skeleton Millésime" />
                <button className="btn" onClick={() => openModal(7)}>View timepiece</button>
              </div>
            </div>
            <button
              className={`floating-arrow right${nextDisabled ? ' disabled' : ''}`}
              onClick={handleNext}
              aria-label="Next cards"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="left">
            <h1>Horologe forge in secret, timeless elegance</h1>
            <p>
              Discover the art of haute horlogerie: hand‑finished movements, 18k gold cases,
              and dials that capture the soul of time.
            </p>
            <div className="buttons">
              <h6 className="outline">service</h6>
              <h6 className="outline">Virtual tour</h6>
              <h6 className="outline">Concierge</h6>
              <h6 className="outline">Heritage</h6>
            </div>
          </div>
          <div className="right">
            <img src="img/234.png" alt="Horologe masterpiece" />
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img src={modalData.image} alt={modalData.title} />
            <h3>{modalData.title}</h3>
            <div className="price">{modalData.price}</div>
            <p>{modalData.desc}</p>
            <ul className="detail-list">
              <li><i className="fa-solid fa-gear"></i> In-house Calibre H-701</li>
              <li><i className="fa-solid fa-clock"></i> 42-hour power reserve</li>
              <li><i className="fa-solid fa-gem"></i> 18k rose gold case</li>
              <li><i className="fa-solid fa-droplet"></i> Water resistant 50m</li>
            </ul>
            <button className="modal-reserve-btn">Reserve this timepiece</button>
          </div>
        </div>
      )}

      <section className="company-section">
        <div className="circle-bg"></div>
        <div className="company-top">
          <div className="company-left">
            <div className="about-tag">
              <div className="tag-dot"></div> L'Art du Temps
            </div>
            <div className="support-box">
              <i className="fa-solid fa-globe"></i>
              <p>Horologists & artisans serving collectors across 32 countries</p>
            </div>
          </div>
          <div className="company-right">
            <h1 className="main-heading">
              We help collectors elevate their legacy through bespoke{' '}
              <span className="light-text">
                mechanical movements, skeleton dials, enamel artistry, and concierge‑level aftercare.
              </span>
            </h1>
            <div className="social-heading">Join our collector's circle</div>
            <div className="divider-line"></div>
            <div className="social-wrapper">
              <div className="social-links">
                <a href="#" className="active-social"><i className="fa-brands fa-x-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-solid fa-globe"></i></a>
              </div>
              <button className="company-btn">
                The Atelier <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="future-wrapper">
          <div className="future-box future-light">Timeless</div>
          <div className="future-box future-gradient">Mechanics</div>
          <div className="future-box future-dark">→</div>
          <div className="future-box future-gray">Future heirlooms</div>
        </div>
      </section>

      <section>
        <div className="container">
          <section className="hero">
            <div className="hero-content">
              <div className="small-text">The Watchmaker's Vision</div>
              <h1 className="hero-title">
                Horologe Atelier is an haute horlogerie<br />house of bold{' '}
                <img className="glow-img" src="img/233.png" alt="watch detail" /> artisans that
                <br />delivers the poetry of precision<br />with{' '}
                <img className="glow-img" src="img/232.png" alt="heritage" /> heritage
              </h1>
              <p>Every gear, every polish, every moon phase — forged by hand in our Geneva workshops.</p>
            </div>
          </section>
          <section className="cards">
            <div className="card dark">
              <div className="tag-btn">Movement</div>
              <h2>In‑house calibres that defy time</h2>
              <p>70+ hours power reserve, COSC precision.</p>
            </div>
            <div className="card dark">
              <div className="tag-btn">Materials</div>
              <img src="img/1.png" alt="gold and steel" />
              <h2>18k gold, titanium & ceramic</h2>
              <p>Only the finest alloys touch your skin.</p>
            </div>
            <div className="card light">
              <div className="tag-btn light">Artistry</div>
              <img src="img/2.png" alt="guilloché dial" />
              <h2>Guilloché & grand feu enamel</h2>
              <p>Dials that become miniature paintings.</p>
            </div>
            <div className="card light">
              <div className="tag-btn light">Legacy</div>
              <h2>Dedicated master watchmakers</h2>
              <p>Each piece assembled by a single artisan.</p>
            </div>
          </section>
        </div>
      </section>

      <section className="creative-section">
        <div className="creative-top">
          <h1 className="creative-title">
            We create striking<br />complications and design<br />that help your wrist<br />tell a story
          </h1>
          <div className="creative-para left-para">
            We combine traditional finishing, micromechanics, and contemporary aesthetics to create watches that inspire collectors.
          </div>
          <div className="creative-para right-para">
            Our creative process blends innovation with archival research, building timepieces that narrate heritage.
          </div>
        </div>
        <div className="creative-cards">
          <div className="creative-card">
            <button className="card-tag">Guilloché</button>
            <div className="card-hover">
              <img src="img/1.png" alt="Guilloché" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Engine‑Turned Dials</h3>
          </div>
          <div className="creative-card">
            <button className="card-tag">Chronograph</button>
            <div className="card-hover">
              <img src="img/2.png" alt="Chronograph" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Flyback Chrono</h3>
          </div>
          <div className="creative-card">
            <button className="card-tag">Tourbillon</button>
            <div className="card-hover">
              <img src="img/3.png" alt="Tourbillon" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Flying Tourbillon</h3>
          </div>
          <div className="creative-card">
            <button className="card-tag">Skeleton</button>
            <div className="card-hover">
              <img src="img/4.png" alt="Skeleton" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Openworked Bridges</h3>
          </div>
          <div className="creative-card">
            <button className="card-tag">Moonphase</button>
            <div className="card-hover">
              <img src="img/5.png" alt="Moonphase" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Astronomical complications</h3>
          </div>
          <div className="creative-card">
            <button className="card-tag">Patrimony</button>
            <div className="card-hover">
              <img src="img/2.png" alt="Patrimony" />
              <button className="card-action">Discover</button>
            </div>
            <h3>Restoration & service</h3>
          </div>
        </div>
        <div className="container">
          <div className="heading">
            <h1>Choose <br /> Your Timepiece</h1>
            <div className="toggle">
              <div
                className="toggle-bg"
                style={{ left: activeToggle === 'personal' ? '5px' : 'calc(50% + 0px)' }}
              ></div>
              <button
                className={activeToggle === 'personal' ? 'active' : ''}
                onClick={() => handleToggle('personal')}
              >
                Classic line
              </button>
              <button
                className={activeToggle === 'business' ? 'active' : ''}
                onClick={() => handleToggle('business')}
              >
                Grand complication
              </button>
            </div>
          </div>
          <div className="cards2">
            <div className="card2 light-card2">
              <div className="badge">
                <div className="dot"></div>Single watch
              </div>
              <div className="content">
                <h2>Classic<br />Edition</h2>
                <p>Automatic, date, 40mm steel case</p>
                <div className="price-box">
                  <small>from</small>
                  <div className="price">$4,900</div>
                  <span>/ watch</span>
                </div>
              </div>
              <div className="bottom">
                <div className="global">
                  <i className="fa-solid fa-globe"></i> Worldwide shipping & duties included
                </div>
                <div className="arrow">↗</div>
              </div>
            </div>
            <div className="card2 dark-card2">
              <div className="badge">
                <div className="dot"></div>Grand complication
              </div>
              <div className="content">
                <h2>Haute Horlogerie<br />Package</h2>
                <p>Tourbillon + perpetual calendar + minute repeater</p>
                <div className="price-box">
                  <small>from</small>
                  <div className="price">$148,000</div>
                  <span>/ unique piece</span>
                </div>
              </div>
              <div className="bottom">
                <div className="global">
                  <i className="fa-solid fa-globe"></i> Private viewing & certification
                </div>
                <div className="arrow">↗</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="zxq-hero-wrap">
        <div className="zxq-dark-layer">
          <div className="zxq-content-box">
            <h1 className="zxq-main-heading">Experience the Magic of Mechanical Artistry</h1>
            <p className="zxq-sub-text">
              Discover breathtaking movements, hand‑finished details, and unforgettable horological moments in our Geneva flagship.
            </p>
            <a href="#" className="zxq-action-btn">
              Reserve a private appointment <span className="zxq-arrow-circle">→</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="qnv-footer-shell">
        <div className="qnv-footer-grid">
          <div className="qnv-brand-side">
            <div className="qnv-brand-logo">
              <i className="fa-solid fa-clock"></i> Horologe Atelier
            </div>
            <p className="qnv-brand-desc">
              We provide curated high watchmaking experiences with master watchmakers, exclusive previews, and lifetime care.
            </p>
          </div>
          <div className="qnv-links-column">
            <h3 className="qnv-title-sm">Quick Links</h3>
            <a href="#">Collections</a>
            <a href="#">Bespoke orders</a>
            <a href="#">Certified pre‑owned</a>
            <a href="#">The journal</a>
          </div>
          <div className="qnv-contact-column">
            <h3 className="qnv-title-sm">Concierge</h3>
            <p>concierge@horologe.com</p>
            <p>+41 22 700 92 00</p>
            <p>Rue du Rhône 62, Geneva</p>
          </div>
          <div className="qnv-subscribe-side">
            <div className="qnv-mail-box">
              <input type="email" placeholder="Receive the catalogue" />
              <button>Subscribe</button>
            </div>
            <div className="qnv-social-row">
              <a href="#">YT</a>
              <a href="#">FB</a>
              <a href="#">IG</a>
              <a href="#">X</a>
            </div>
          </div>
        </div>
        <div className="qnv-copy-strip">
          © 2026 Horologe Atelier — where time becomes legacy.
        </div>
      </footer>
    </>
  );
}

export default App;