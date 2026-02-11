import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

// Fork-launchpad pages (styled frontend)
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import LaunchPad from "@/pages/LaunchPad";
import ProjectDetail from "@/pages/ProjectDetail";
import Hackathons from "@/pages/Hackathons";
import HackathonDetail from "@/pages/HackathonDetail";
import HackathonSubmit from "@/pages/HackathonSubmit";
import MyHackathon from "@/pages/MyHackathon";
import { HackathonManage, CreateHackathon, HackathonScoreboard } from "@/modules/hackathon";
import Profile from "@/pages/Profile";
import Community from "@/pages/Community";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import InvestorExplore from "@/pages/investor/InvestorExplore";
import InvestorFund from "@/pages/investor/InvestorFund";
import MyInvestments from "@/pages/investor/MyInvestments";
import ProjectWallets from "@/pages/investor/ProjectWallets";

// Backend-connected pages (startups API)
import StartupDetail from "@/pages/StartupDetail";
import StartupSubmission from "@/pages/StartupSubmission";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/launchpad" element={<LaunchPad />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/my-hackathon" element={<MyHackathon />} />
            <Route path="/hackathon/create" element={<CreateHackathon />} />
            <Route path="/hackathon/:id" element={<HackathonDetail />} />
            <Route path="/hackathon/:id/submit" element={<HackathonSubmit />} />
            <Route path="/hackathon/:id/manage" element={<HackathonManage />} />
            <Route path="/hackathon/:id/scoreboard" element={<HackathonScoreboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="/investor/explore" element={<InvestorExplore />} />
            <Route path="/investor/fund" element={<InvestorFund />} />
            <Route path="/investor/my-investments" element={<MyInvestments />} />
            <Route path="/investor/wallets" element={<ProjectWallets />} />
            {/* Backend: submit startup, view startup by id */}
            <Route path="/submit" element={<StartupSubmission />} />
            <Route path="/startup/:id" element={<StartupDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
