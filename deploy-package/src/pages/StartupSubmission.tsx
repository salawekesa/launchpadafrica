import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Target, 
  DollarSign, 
  Globe, 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubmissionData {
  // Basic Information
  name: string;
  tagline: string;
  description: string;
  category: "Web2" | "Web3" | "";
  stage: string;
  foundedDate: string;
  
  // Team Information
  founderName: string;
  founderEmail: string;
  founderBio: string;
  teamSize: string;
  teamMembers: Array<{ name: string; role: string; bio: string }>;
  
  // Business Details
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  revenue: string;
  funding: string;
  
  // Contact & Links
  website: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
  
  // Additional Information
  milestones: string;
  challenges: string;
  vision: string;
}

const StartupSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<SubmissionData>({
    name: "",
    tagline: "",
    description: "",
    category: "",
    stage: "",
    foundedDate: "",
    founderName: "",
    founderEmail: "",
    founderBio: "",
    teamSize: "",
    teamMembers: [{ name: "", role: "", bio: "" }],
    problem: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    revenue: "",
    funding: "",
    website: "",
    email: "",
    twitter: "",
    linkedin: "",
    github: "",
    milestones: "",
    challenges: "",
    vision: ""
  });

  const handleInputChange = (field: keyof SubmissionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: "", role: "", bio: "" }]
    }));
  };

  const removeTeamMember = (index: number) => {
    if (formData.teamMembers.length > 1) {
      const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Startup name is required.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.category) {
        toast({
          title: "Validation Error", 
          description: "Please select a category.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.stage) {
        toast({
          title: "Validation Error",
          description: "Please select a stage.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare team members data
      const teamMembers = formData.teamMembers.filter(member => member.name.trim());
      
      // Prepare startup data
      const startupData = {
        name: formData.name,
        description: formData.description,
        category: formData.category as "Web2" | "Web3", // Type assertion after validation
        stage: formData.stage,
        users: "0", // Default value for new submissions
        growth: "+0%", // Default value for new submissions
        tagline: formData.tagline,
        founded_date: formData.foundedDate,
        founder_name: formData.founderName,
        founder_email: formData.founderEmail,
        founder_bio: formData.founderBio,
        team_size: formData.teamSize,
        problem: formData.problem,
        solution: formData.solution,
        target_market: formData.targetMarket,
        business_model: formData.businessModel,
        revenue: formData.revenue,
        funding: formData.funding,
        website: formData.website,
        email: formData.email,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        github: formData.github,
        milestones: formData.milestones,
        challenges: formData.challenges,
        vision: formData.vision,
        teamMembers
      };
      
      // Save via API
      const response = await fetch('http://localhost:3001/api/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(startupData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit startup');
      }
      
      const result = await response.json();
      
      toast({
        title: "Submission Successful!",
        description: "Your startup has been submitted for review. You'll receive an email confirmation shortly.",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your startup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "team", label: "Team", icon: Users },
    { id: "business", label: "Business", icon: Target },
    { id: "contact", label: "Contact", icon: Globe },
    { id: "additional", label: "Additional", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <Clock className="w-3 h-3" />
                Draft
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Submit Your Startup</h1>
            <p className="text-lg text-muted-foreground">
              Share your startup with our community and get the support you need to grow.
            </p>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Startup Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your startup name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input
                      id="tagline"
                      value={formData.tagline}
                      onChange={(e) => handleInputChange("tagline", e.target.value)}
                      placeholder="One-line description of your startup"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Detailed description of your startup"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web2">Web2</SelectItem>
                        <SelectItem value="Web3">Web3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage *</Label>
                    <Select value={formData.stage} onValueChange={(value) => handleInputChange("stage", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Idea">Idea</SelectItem>
                        <SelectItem value="MVP">MVP</SelectItem>
                        <SelectItem value="Early Stage">Early Stage</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Scale">Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="foundedDate">Founded Date</Label>
                    <Input
                      id="foundedDate"
                      type="date"
                      value={formData.foundedDate}
                      onChange={(e) => handleInputChange("foundedDate", e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Team Information Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Team Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="founderName">Founder Name *</Label>
                      <Input
                        id="founderName"
                        value={formData.founderName}
                        onChange={(e) => handleInputChange("founderName", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="founderEmail">Founder Email *</Label>
                      <Input
                        id="founderEmail"
                        type="email"
                        value={formData.founderEmail}
                        onChange={(e) => handleInputChange("founderEmail", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="founderBio">Founder Bio *</Label>
                      <Textarea
                        id="founderBio"
                        value={formData.founderBio}
                        onChange={(e) => handleInputChange("founderBio", e.target.value)}
                        placeholder="Tell us about yourself and your background"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Select value={formData.teamSize} onValueChange={(value) => handleInputChange("teamSize", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Just me</SelectItem>
                          <SelectItem value="2-5">2-5 people</SelectItem>
                          <SelectItem value="6-10">6-10 people</SelectItem>
                          <SelectItem value="11-20">11-20 people</SelectItem>
                          <SelectItem value="20+">20+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <Button variant="outline" onClick={addTeamMember}>
                        Add Member
                      </Button>
                    </div>
                    
                    {formData.teamMembers.map((member, index) => (
                      <Card key={index} className="p-4 mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Team Member {index + 1}</h4>
                          {formData.teamMembers.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeTeamMember(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                              placeholder="Member name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                              value={member.role}
                              onChange={(e) => handleTeamMemberChange(index, "role", e.target.value)}
                              placeholder="e.g., CTO, Designer"
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label>Bio</Label>
                            <Textarea
                              value={member.bio}
                              onChange={(e) => handleTeamMemberChange(index, "bio", e.target.value)}
                              placeholder="Brief bio"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Business Details Tab */}
            <TabsContent value="business" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Business Details
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem Statement *</Label>
                    <Textarea
                      id="problem"
                      value={formData.problem}
                      onChange={(e) => handleInputChange("problem", e.target.value)}
                      placeholder="What problem does your startup solve?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solution">Solution *</Label>
                    <Textarea
                      id="solution"
                      value={formData.solution}
                      onChange={(e) => handleInputChange("solution", e.target.value)}
                      placeholder="How does your startup solve this problem?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetMarket">Target Market *</Label>
                    <Textarea
                      id="targetMarket"
                      value={formData.targetMarket}
                      onChange={(e) => handleInputChange("targetMarket", e.target.value)}
                      placeholder="Who are your target customers?"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessModel">Business Model</Label>
                      <Textarea
                        id="businessModel"
                        value={formData.businessModel}
                        onChange={(e) => handleInputChange("businessModel", e.target.value)}
                        placeholder="How do you make money?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Current Revenue</Label>
                      <Select value={formData.revenue} onValueChange={(value) => handleInputChange("revenue", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select revenue range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Pre-revenue</SelectItem>
                          <SelectItem value="1k-10k">$1K - $10K</SelectItem>
                          <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                          <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                          <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                          <SelectItem value="500k+">$500K+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="funding">Funding Status</Label>
                      <Select value={formData.funding} onValueChange={(value) => handleInputChange("funding", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="series-c+">Series C+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Contact & Links Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Contact & Links
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourstartup.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="contact@yourstartup.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                      placeholder="@yourstartup"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/company/yourstartup"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => handleInputChange("github", e.target.value)}
                      placeholder="https://github.com/yourstartup"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Additional Information
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="milestones">Key Milestones</Label>
                    <Textarea
                      id="milestones"
                      value={formData.milestones}
                      onChange={(e) => handleInputChange("milestones", e.target.value)}
                      placeholder="What are your key achievements and milestones?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="challenges">Current Challenges</Label>
                    <Textarea
                      id="challenges"
                      value={formData.challenges}
                      onChange={(e) => handleInputChange("challenges", e.target.value)}
                      placeholder="What challenges are you currently facing?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vision">Vision & Goals</Label>
                    <Textarea
                      id="vision"
                      value={formData.vision}
                      onChange={(e) => handleInputChange("vision", e.target.value)}
                      placeholder="What's your long-term vision for the startup?"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupSubmission;
