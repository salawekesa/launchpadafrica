import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Calendar,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Heart,
  Share2,
  DollarSign,
  UserPlus,
  MessageCircle,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Briefcase,
  GraduationCap,
  Handshake
} from "lucide-react";
import { useStartups } from "@/hooks/useStartups";
import { useState } from "react";

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: startups, isLoading } = useStartups();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [supportType, setSupportType] = useState('');
  const [supportData, setSupportData] = useState({
    name: '',
    email: '',
    message: '',
    experience: '',
    investmentAmount: '',
    availability: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleLike = async () => {
    setIsLiked(!isLiked);
    // Log activity
    try {
      await fetch('http://localhost:3001/api/user/1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_id: parseInt(id || '0'),
          activity_type: isLiked ? 'unlike' : 'like',
          activity_data: { timestamp: new Date().toISOString() }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited);
    // Log activity
    try {
      await fetch('http://localhost:3001/api/user/1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_id: parseInt(id || '0'),
          activity_type: isFavorited ? 'unfavorite' : 'favorite',
          activity_data: { timestamp: new Date().toISOString() }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleShare = async () => {
    // Log activity
    try {
      await fetch('http://localhost:3001/api/user/1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_id: parseInt(id || '0'),
          activity_type: 'share',
          activity_data: { timestamp: new Date().toISOString() }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(window.location.href);
  };

  const handleSupportClick = (type: string) => {
    setSupportType(type);
    setShowSupportDialog(true);
  };

  const handleSupportSubmit = async () => {
    setSubmissionStatus('submitting');
    try {
      await fetch('http://localhost:3001/api/user/1/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_id: parseInt(id || '0'),
          interaction_type: supportType,
          interaction_data: supportData
        })
      });
      
      setSubmissionStatus('success');
      setTimeout(() => {
        setShowSupportDialog(false);
        setSubmissionStatus('idle');
        setSupportData({
          name: '',
          email: '',
          message: '',
          experience: '',
          investmentAmount: '',
          availability: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting interaction:', error);
      setSubmissionStatus('error');
    }
  };

  const getSupportIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <DollarSign className="w-5 h-5" />;
      case 'hiring':
        return <UserPlus className="w-5 h-5" />;
      case 'mentorship':
        return <GraduationCap className="w-5 h-5" />;
      case 'partnership':
        return <Handshake className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getSupportTitle = (type: string) => {
    switch (type) {
      case 'investment':
        return 'Investment Opportunity';
      case 'hiring':
        return 'Join Our Team';
      case 'mentorship':
        return 'Seeking Mentorship';
      case 'partnership':
        return 'Strategic Partnership';
      default:
        return 'Support';
    }
  };

  const getSupportDescription = (type: string) => {
    switch (type) {
      case 'investment':
        return 'We are seeking Series A funding to scale our AI platform globally';
      case 'hiring':
        return 'Looking for talented developers and data scientists';
      case 'mentorship':
        return 'Need guidance on scaling and market expansion';
      case 'partnership':
        return 'Open to partnerships with enterprise clients';
      default:
        return 'Support this startup';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const startup = startups?.find(s => s.id === parseInt(id || "0"));
  
  if (!startup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Startup not found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Startups
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card className="p-8 gradient-card border-border/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl font-bold">
                  {startup.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold">{startup.name}</h1>
                    <Badge 
                      variant="outline" 
                      className={startup.category === "Web3" 
                        ? "border-accent text-accent" 
                        : "border-primary text-primary"
                      }
                    >
                      {startup.category}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    {startup.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Founded {new Date(startup.created_at).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary">{startup.stage}</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Metrics */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {startup.users && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{startup.users}</p>
                    </div>
                  </div>
                )}
                {startup.growth && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="text-2xl font-bold text-accent">{startup.growth}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* About Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">About {startup.name}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {startup.description} We're building the future of technology and looking for passionate individuals 
                to join our mission. Our team is dedicated to creating innovative solutions that make a real 
                difference in people's lives.
              </p>
            </Card>

            {/* Team & Culture */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Team & Culture</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm text-muted-foreground">Founder & CEO</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                    JS
                  </div>
                  <div>
                    <p className="font-semibold">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">CTO</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Options */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Ways to Support</h2>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start gap-3" 
                  variant="outline"
                  onClick={() => handleSupportClick('investment')}
                >
                  <DollarSign className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Invest</p>
                    <p className="text-xs text-muted-foreground">Support with funding</p>
                  </div>
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3" 
                  variant="outline"
                  onClick={() => handleSupportClick('hiring')}
                >
                  <UserPlus className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Join Team</p>
                    <p className="text-xs text-muted-foreground">Work with us</p>
                  </div>
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3" 
                  variant="outline"
                  onClick={() => handleSupportClick('mentorship')}
                >
                  <GraduationCap className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Mentor</p>
                    <p className="text-xs text-muted-foreground">Share expertise</p>
                  </div>
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3" 
                  variant="outline"
                  onClick={() => handleSupportClick('partnership')}
                >
                  <Handshake className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Partner</p>
                    <p className="text-xs text-muted-foreground">Strategic partnership</p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Contact & Links */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Globe className="w-4 h-4" />
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Mail className="w-4 h-4" />
                  Contact Team
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Twitter className="w-4 h-4" />
                  Follow on Twitter
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Linkedin className="w-4 h-4" />
                  Connect on LinkedIn
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={handleFavorite}
                  variant={isFavorited ? "default" : "outline"}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Startup
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getSupportIcon(supportType)}
              {getSupportTitle(supportType)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {getSupportDescription(supportType)}
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={supportData.name}
                  onChange={(e) => setSupportData({...supportData, name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={supportData.email}
                  onChange={(e) => setSupportData({...supportData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              
              {supportType === 'investment' && (
                <div>
                  <Label htmlFor="amount">Investment Amount</Label>
                  <Input
                    id="amount"
                    value={supportData.investmentAmount}
                    onChange={(e) => setSupportData({...supportData, investmentAmount: e.target.value})}
                    placeholder="e.g., $50,000"
                  />
                </div>
              )}
              
              {supportType === 'hiring' && (
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={supportData.experience}
                    onChange={(e) => setSupportData({...supportData, experience: e.target.value})}
                    placeholder="Tell us about your relevant experience"
                  />
                </div>
              )}
              
              {supportType === 'mentorship' && (
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={supportData.availability}
                    onChange={(e) => setSupportData({...supportData, availability: e.target.value})}
                    placeholder="e.g., 2 hours per week"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={supportData.message}
                  onChange={(e) => setSupportData({...supportData, message: e.target.value})}
                  placeholder="Tell us more about your interest..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSupportSubmit}
                disabled={submissionStatus === 'submitting'}
                className="flex-1"
              >
                {submissionStatus === 'submitting' ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : submissionStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submitted!
                  </>
                ) : submissionStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Error
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartupDetail;
