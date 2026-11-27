import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  ExternalLink,
  Activity,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Star,
  History,
  Target,
  Users
} from "lucide-react";

interface Submission {
  id: number;
  name: string;
  tagline?: string;
  category: "Web2" | "Web3";
  stage: string;
  status: number;
  created_at: string;
  reviewed_at?: string;
  admin_feedback?: string;
}

interface UserActivity {
  id: number;
  user_id: number;
  startup_id: number;
  activity_type: string;
  activity_data?: any;
  created_at: string;
  startup_name?: string;
  category?: string;
}

interface UserInteraction {
  id: number;
  user_id: number;
  startup_id: number;
  interaction_type: string;
  interaction_data?: any;
  status: string;
  created_at: string;
  updated_at: string;
  startup_name?: string;
  category?: string;
}

const Profile = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submissions");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get all startups from API
      const [startupsResponse, activitiesResponse, interactionsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/startups'),
        fetch('http://localhost:3001/api/user/1/activities'),
        fetch('http://localhost:3001/api/user/1/interactions')
      ]);

      if (startupsResponse.ok) {
        const startups = await startupsResponse.json();
        setSubmissions(startups);
      }

      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json();
        setActivities(activities);
      }

      if (interactionsResponse.ok) {
        const interactions = await interactionsResponse.json();
        setInteractions(interactions);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2: // Approved
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 3: // Under Review
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 4: // Rejected
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: // Pending (status = 1)
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'share':
        return <Share2 className="w-4 h-4" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      case 'favorite':
        return <Star className="w-4 h-4" />;
      case 'interaction':
        return <Target className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'view':
        return 'text-blue-600';
      case 'like':
        return 'text-red-600';
      case 'share':
        return 'text-green-600';
      case 'comment':
        return 'text-purple-600';
      case 'favorite':
        return 'text-yellow-600';
      case 'interaction':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInteractionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <User className="w-3 h-3" />
                Profile
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your startup submissions and track their status.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    JD
                  </div>
                  <h2 className="text-xl font-bold">John Doe</h2>
                  <p className="text-muted-foreground">Founder & CEO</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">john@example.com</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Member since Jan 2024</span>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Submissions</span>
                    <span className="font-semibold">{submissions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Approved</span>
                    <span className="font-semibold text-green-600">
                      {submissions.filter(s => s.status === 2).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Under Review</span>
                    <span className="font-semibold text-yellow-600">
                      {submissions.filter(s => s.status === 3).length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content with Tabs */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="submissions" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Submissions
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Activities
                  </TabsTrigger>
                  <TabsTrigger value="interactions" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Interactions
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Stats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="submissions" className="mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Submissions</h2>
                    <Link to="/submit">
                      <Button>
                        <Building2 className="w-4 h-4 mr-2" />
                        Submit New Startup
                      </Button>
                    </Link>
                  </div>
              
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{submission.name}</h3>
                              {getStatusBadge(submission.status)}
                            </div>
                            <p className="text-muted-foreground mb-2">{submission.tagline}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{submission.category}</Badge>
                              <Badge variant="secondary">{submission.stage}</Badge>
                              <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {submission.status === 4 && (
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {submission.admin_feedback && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Admin Feedback
                            </h4>
                            <p className="text-sm text-muted-foreground">{submission.admin_feedback}</p>
                            {submission.reviewed_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Reviewed on {new Date(submission.reviewed_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {submission.status === 2 && (
                          <div className="mt-4 flex items-center gap-2">
                            <Link to={`/startup/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Live Listing
                              </Button>
                            </Link>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  
                  {submissions.length === 0 && (
                    <Card className="p-8 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Submit your first startup to get started!
                      </p>
                      <Link to="/submit">
                        <Button>
                          <Building2 className="w-4 h-4 mr-2" />
                          Submit Your First Startup
                        </Button>
                      </Link>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activities" className="mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Activity History</h2>
                    <Badge variant="outline" className="gap-2">
                      <History className="w-3 h-3" />
                      {activities.length} Activities
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold capitalize">{activity.activity_type}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.startup_name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {activity.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {activities.length === 0 && (
                      <Card className="p-8 text-center">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                        <p className="text-muted-foreground">
                          Start exploring startups to see your activity history here!
                        </p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="interactions" className="mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Interactions</h2>
                    <Badge variant="outline" className="gap-2">
                      <Target className="w-3 h-3" />
                      {interactions.length} Interactions
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <Card key={interaction.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-muted text-orange-600">
                              <Target className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold capitalize">{interaction.interaction_type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {interaction.startup_name}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {interaction.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(interaction.created_at).toLocaleString()}
                              </p>
                              {interaction.interaction_data && (
                                <p className="text-sm text-muted-foreground">
                                  {JSON.stringify(interaction.interaction_data)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInteractionStatusBadge(interaction.status)}
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {interactions.length === 0 && (
                      <Card className="p-8 text-center">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No interactions yet</h3>
                        <p className="text-muted-foreground">
                          Start supporting startups to see your interactions here!
                        </p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Statistics</h2>
                    <Badge variant="outline" className="gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Overview
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Submissions</p>
                          <p className="text-2xl font-bold">{submissions.length}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Activities</p>
                          <p className="text-2xl font-bold">{activities.length}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Target className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interactions</p>
                          <p className="text-2xl font-bold">{interactions.length}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Approved</p>
                          <p className="text-2xl font-bold">
                            {submissions.filter(s => s.status === 2).length}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
                    <div className="space-y-3">
                      {['view', 'like', 'share', 'comment', 'favorite'].map((type) => {
                        const count = activities.filter(a => a.activity_type === type).length;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${getActivityColor(type)}`}>
                                {getActivityIcon(type)}
                              </div>
                              <span className="capitalize">{type}s</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
