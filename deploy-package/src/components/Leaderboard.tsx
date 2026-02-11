import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Leaderboard = () => {
  const { data: leaderboardData, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Top Performing{" "}
              <span className="gradient-accent bg-clip-text">
                Startups
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating the fastest-growing startups in our community
            </p>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Top Performing{" "}
              <span className="gradient-accent bg-clip-text">
                Startups
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating the fastest-growing startups in our community
            </p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load leaderboard. Please check your database connection.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  const leaderboard = leaderboardData || [];
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Top Performing{" "}
            <span className="gradient-accent bg-clip-text">
              Startups
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Celebrating the fastest-growing startups in our community
          </p>
        </div>

        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const getIcon = (rank: number) => {
              if (rank === 1) return Trophy;
              if (rank === 2) return Medal;
              if (rank === 3) return Award;
              return TrendingUp;
            };
            const Icon = getIcon(entry.rank);
            return (
              <Card
                key={entry.id}
                className="gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-102 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                        ${entry.rank === 1 ? "gradient-primary glow-primary" : ""}
                        ${entry.rank === 2 ? "gradient-accent glow-accent" : ""}
                        ${entry.rank === 3 ? "bg-primary/20 text-primary" : ""}
                        ${entry.rank > 3 ? "bg-secondary text-foreground" : ""}
                      `}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg truncate">{entry.startup.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            entry.startup.category === "Web3"
                              ? "border-accent text-accent"
                              : "border-primary text-primary"
                          }
                        >
                          {entry.startup.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Rank #{entry.rank}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-accent bg-clip-text">
                      {entry.growth_rate}
                    </div>
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
