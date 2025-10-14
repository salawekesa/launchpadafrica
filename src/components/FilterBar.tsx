import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    onFilterChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Filter Startups</h2>
      </div>

      <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full sm:w-auto">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-card border border-border">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="web2"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Web2
          </TabsTrigger>
          <TabsTrigger 
            value="web3"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Web3
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Button variant="outline" size="sm" className="border-border hover:border-primary">
        More Filters
      </Button>
    </div>
  );
};

export default FilterBar;
