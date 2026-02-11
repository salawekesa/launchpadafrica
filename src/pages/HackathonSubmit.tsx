import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle, ExternalLink, Code, Presentation, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHackathonStore } from '@/modules/hackathon';
import { useAuthStore } from '@/store/auth-store';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HackathonSubmit() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { getHackathonById, loadHackathonById, getMyParticipation, submitProject, isLoading, error } = useHackathonStore();

  const [participation, setParticipation] = useState<{
    id: string;
    status: string;
    projectName?: string;
    teamName?: string;
    pitchText?: string;
    repoUrl?: string;
    demoUrl?: string;
  } | null>(null);
  const [loadingPart, setLoadingPart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [pitchText, setPitchText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  useEffect(() => {
    if (id) loadHackathonById(id);
  }, [id, loadHackathonById]);

  useEffect(() => {
    if (!id || !user?.id) {
      setLoadingPart(false);
      return;
    }
    setLoadingPart(true);
    getMyParticipation(id, user.id).then((p) => {
      setParticipation(p ?? null);
      if (p?.projectName) setProjectName(p.projectName);
      if (p?.teamName) setTeamName(p.teamName);
      if ((p as { pitchText?: string })?.pitchText) setPitchText((p as { pitchText?: string }).pitchText ?? '');
      if ((p as { repoUrl?: string })?.repoUrl) setRepoUrl((p as { repoUrl?: string }).repoUrl ?? '');
      if ((p as { demoUrl?: string })?.demoUrl) setDemoUrl((p as { demoUrl?: string }).demoUrl ?? '');
      if ((p as { attachmentUrl?: string })?.attachmentUrl) setAttachmentUrl((p as { attachmentUrl?: string }).attachmentUrl ?? '');
      setLoadingPart(false);
    });
  }, [id, user?.id, getMyParticipation]);

  const hackathon = id ? getHackathonById(id) : undefined;

  if (!isAuthenticated) {
    return (
      <div className="container py-8 max-w-xl">
        <p className="text-muted-foreground mb-4">Sign in to submit a project to this hackathon.</p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!hackathon) {
    if (isLoading) return <div className="container py-8">Loading...</div>;
    return <Navigate to="/hackathons" replace />;
  }

  const isSubmitted = participation?.status === 'submitted' && participation?.projectName;
  const canSubmit = hackathon.status === 'active' || hackathon.status === 'upcoming' || hackathon.status === 'judging';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSubmitError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl?.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, filename: file.name }),
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setAttachmentUrl(data.url ?? '');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitProject({
        hackathonId: id,
        userId: user.id,
        projectName: projectName.trim() || undefined,
        teamName: teamName.trim() || undefined,
        pitchText: pitchText.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      setSuccess(true);
      const p = await getMyParticipation(id, user.id);
      setParticipation(p ?? null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-2">
          <Link to={`/hackathon/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Hackathon
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Submit your project</h1>
          <p className="text-muted-foreground">{hackathon.name}</p>
        </motion.div>

        {!canSubmit && (
          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Submissions are closed for this hackathon. You can still view the scoreboard and winners.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to={`/hackathon/${id}/scoreboard`}>View scoreboard</Link>
            </Button>
          </motion.div>
        )}

        {loadingPart ? (
          <p className="text-muted-foreground">Loading your participation...</p>
        ) : success ? (
          <motion.div variants={fadeUp} className="rounded-xl border border-success/30 bg-success/5 p-6 flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-success mb-3" />
            <h2 className="text-lg font-semibold mb-1">Submission received</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your project has been submitted. Judges will review and score submissions.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to={`/hackathon/${id}`}>Back to hackathon</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={`/hackathon/${id}/scoreboard`}>View scoreboard</Link>
              </Button>
            </div>
          </motion.div>
        ) : isSubmitted && !submitting ? (
          <motion.div variants={fadeUp}>
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <h2 className="font-semibold mb-2">Your submission</h2>
              <p className="text-muted-foreground text-sm mb-4">{participation?.projectName ?? '—'}</p>
              {participation?.teamName && (
                <p className="text-sm text-muted-foreground mb-2">Team: {participation.teamName}</p>
              )}
              {(participation as { repoUrl?: string })?.repoUrl && (
                <a
                  href={(participation as { repoUrl?: string }).repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Code className="w-4 h-4" /> Repo
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {(participation as { demoUrl?: string })?.demoUrl && (
                <a
                  href={(participation as { demoUrl?: string }).demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline mt-1"
                >
                  <Presentation className="w-4 h-4" /> Demo
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {(participation as { attachmentUrl?: string })?.attachmentUrl && (
                <a
                  href={(participation as { attachmentUrl?: string }).attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline mt-1"
                >
                  <FileText className="w-4 h-4" /> Attachment
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {canSubmit && (
              <p className="text-sm text-muted-foreground mb-4">
                You can update your submission below and resubmit.
              </p>
            )}
          </motion.div>
        ) : null}

        {canSubmit && (
          <motion.div variants={fadeUp}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project name *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamName">Team name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team Alpha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pitchText">Pitch / description</Label>
                <Textarea
                  id="pitchText"
                  value={pitchText}
                  onChange={(e) => setPitchText(e.target.value)}
                  placeholder="What does your project do? What problem does it solve?"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo / video URL</Label>
                <Input
                  id="demoUrl"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Upload attachment (PDF, image, or zip)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.zip,.png,.jpg,.jpeg,.gif"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="max-w-xs"
                  />
                  {attachmentUrl && (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      <FileText className="w-4 h-4" /> View
                    </a>
                  )}
                </div>
                {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
              </div>
              <Button type="submit" disabled={submitting || uploading || !projectName.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                {participation?.status === 'submitted' ? 'Update submission' : 'Submit project'}
              </Button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
