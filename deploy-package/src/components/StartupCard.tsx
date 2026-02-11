import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface StartupCardProps {
  id: number;
  name: string;
  description: string;
  category: "Web2" | "Web3";
  stage: string;
  users: string;
  growth: string;
  created_at: string;
  updated_at: string;
}

const StartupCard = ({ id, name, description, category, stage, users, growth }: StartupCardProps) => {
  return (
    <Card className="group relative overflow-hidden gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow-primary hover:scale-105">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl font-bold">
            {name.charAt(0)}
          </div>
          <Badge 
            variant="outline" 
            className={category === "Web3" 
              ? "border-accent text-accent" 
              : "border-primary text-primary"
            }
          >
            {category}
          </Badge>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
          <Badge variant="secondary" className="text-xs">
            {stage}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="flex gap-4 pt-4 border-t border-border/50">
          {users && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{users}</span>
            </div>
          )}
          {growth && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-accent">{growth}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link to={`/startup/${id}`}>
          <Button 
            variant="ghost" 
            className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
          >
            View Details
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default StartupCard;
