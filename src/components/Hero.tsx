import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Empowering Innovation</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "5s" }}>
          Welcome to the {""}
          <span className="gradient-primary bg-clip-text">
            {(() => {
              const words = [
                "Launchpad",
                "Hub",
                "Platform",
                "Ecosystem",
                "Spark Zone",
                "Innovation Lab",
                "Future Space",
                "Pioneer Arena",
                "Growth Network",
                "Startup Sphere"
              ];
              const [index, setIndex] = React.useState(() => Math.floor(Math.random() * words.length));
              React.useEffect(() => {
                const interval = setInterval(() => {
                  setIndex(i => (i + 1) % words.length);
                }, 3000);
                return () => clearInterval(interval);
              }, []);
              return words[index];
            })()}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Discover, support, and celebrate the next generation of Web2 and Web3 startups.
          Building the future, together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300">
            <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            Explore Startups
          </Button>
          <Link to="/submit">
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              Submit Your Startup
            </Button>
          </Link>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-primary bg-clip-text  mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Active Startups</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-accent bg-clip-text mb-2">$2M+</div>
            <div className="text-sm text-muted-foreground">Funding Raised</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-primary bg-clip-text mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Community Members</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
