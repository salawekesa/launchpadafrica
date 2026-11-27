import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import StartupShowcase from "@/components/StartupShowcase";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <div id="startups">
          <StartupShowcase />
        </div>
        <div id="leaderboard">
          <Leaderboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
