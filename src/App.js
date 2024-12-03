import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [code, setCode] = useState("");
  const [canSpin, setCanSpin] = useState(false);
  const [ipAddress, setIpAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Répartition des lots
  const prizes = [
    { label: "Film hydrogel", color: "#007bff" }, // Bleu
    { label: "Coque renforcée", color: "#28a745" }, // Vert
    { label: "Perdu", color: "#dc3545" }, // Rouge
    { label: "Film hydrogel", color: "#007bff" }, // Bleu
    { label: "TV", color: "#ffc107" }, // Jaune
    { label: "Coque renforcée", color: "#28a745" }, // Vert
    { label: "Perdu", color: "#dc3545" }, // Rouge
    { label: "Film hydrogel", color: "#007bff" }, // Bleu
    { label: "Coque renforcée", color: "#28a745" }, // Vert
    { label: "Perdu", color: "#dc3545" }, // Rouge
  ];

  const generateCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let generatedCode = "";
    for (let i = 0; i < 6; i++) {
      generatedCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return generatedCode;
  };

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);

    const safePrizes = ["Film hydrogel", "Coque renforcée"];
    const selectedPrize = safePrizes[Math.floor(Math.random() * safePrizes.length)];
    const prizeIndex = prizes.findIndex((prize) => prize.label === selectedPrize);

    const segmentAngle = 360 / prizes.length;
    const randomOffset = Math.random() * segmentAngle;
    const targetAngle = 3600 + prizeIndex * segmentAngle + randomOffset;

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedPrize);
      setCode(generateCode());

      // Marquer l'IP comme ayant joué
      if (ipAddress) {
        localStorage.setItem(ipAddress, "played");
        setCanSpin(false);
      }
    }, 4000);
  };

  useEffect(() => {
    // Récupérer l'adresse IP
    axios
      .get("https://api.ipify.org?format=json")
      .then((response) => {
        const ip = response.data.ip;
        setIpAddress(ip);

        // Vérifier si l'utilisateur a déjà joué
        const hasPlayed = localStorage.getItem(ip);
        if (hasPlayed) {
          setCanSpin(false);
        } else {
          setCanSpin(true);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération de l'adresse IP :", error);
      });
  }, []);

  const renderWheel = () => {
    const radius = 150; // Rayon de la roue
    const anglePerSegment = 360 / prizes.length;

    return prizes.map((prize, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      const x1 = radius + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = radius + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = radius + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = radius + radius * Math.sin((Math.PI * endAngle) / 180);

      return (
        <path
          key={index}
          d={`M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`}
          fill={prize.color}
        />
      );
    });
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Jeu de la Roulette</h1>
        <div className="roulette-wrapper">
          <svg
            className="roulette"
            width="300"
            height="300"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {renderWheel()}
          </svg>
          <div className="arrow"></div>
        </div>
        <button onClick={handleSpin} disabled={!canSpin || isSpinning}>
          {isSpinning
            ? "Roulette en cours..."
            : !canSpin
            ? "Vous avez déjà joué !"
            : "Lancer la Roulette"}
        </button>
        <button onClick={() => setShowModal(true)} className="see-lots-btn">
          Voir les lots
        </button>
        {result && (
          <div className="result">
            <h2>Bravo,vous avez gagné {result} !</h2>
            <p>
              Rendez-vous dans votre agence Coriolis pour récupérer le cadeau
              via le code suivant:
            </p>
            <h3>{code}</h3>
          </div>
        )}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Liste des lots</h2>
              <ul>
                {prizes.map((prize, index) => (
                  <li key={index} className="lot-item">
                    <span
                      className="color-box"
                      style={{ backgroundColor: prize.color }}
                    ></span>
                    {prize.label}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
