import { useState } from "react";
import StartupCard from "./StartupCard";
import FilterBar from "./FilterBar";
import { useStartups } from "@/hooks/useStartups";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const StartupShowcase = () => {
  const [filter, setFilter] = useState("all");
  const { data: startups, isLoading, error } = useStartups(filter === "all" ? undefined : filter);

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Startups
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore innovative projects from our thriving community
            </p>
          </div>
          <FilterBar onFilterChange={setFilter} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Startups
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore innovative projects from our thriving community
            </p>
          </div>
          <FilterBar onFilterChange={setFilter} />
          <Alert className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load startups. Please check your database connection.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  const filteredStartups = startups || [];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Startups
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore innovative projects from our thriving community
          </p>
        </div>

        <FilterBar onFilterChange={setFilter} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredStartups.map((startup, index) => (
            <div
              key={startup.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StartupCard {...startup} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StartupShowcase;
