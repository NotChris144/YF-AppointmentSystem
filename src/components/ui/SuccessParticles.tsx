import { useCallback } from "react";
import type { Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

interface SuccessParticlesProps {
  className?: string;
}

const SuccessParticles: React.FC<SuccessParticlesProps> = ({ className }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      className={className}
      init={particlesInit}
      options={{
        fullScreen: false,
        particles: {
          number: {
            value: 40,
            density: {
              enable: true,
              area: 800
            }
          },
          color: {
            value: ["#22c55e", "#eab308", "#3b82f6", "#ec4899"]
          },
          shape: {
            type: ["circle", "square"]
          },
          opacity: {
            value: { min: 0.6, max: 1 }
          },
          size: {
            value: { min: 3, max: 5 }
          },
          move: {
            enable: true,
            direction: "none",
            random: true,
            speed: 3,
            straight: false,
            outModes: {
              default: "bounce"
            }
          }
        }
      }}
    />
  );
};

export default SuccessParticles;
