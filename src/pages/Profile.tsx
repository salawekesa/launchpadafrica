import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ExternalLink
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

const Profile = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Get all startups from API
      const response = await fetch('http://localhost:3001/api/startups');
      if (!response.ok) {
        throw new Error('Failed to fetch startups');
      }
      const startups = await response.json();
      setSubmissions(startups);
    } catch (error) {
      console.error('Error fetching submissions:', error);
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

            {/* Submissions */}
            <div className="lg:col-span-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
