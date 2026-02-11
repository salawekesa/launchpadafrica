import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JudgingCriterion, HackathonParticipant, SubmitScoreInput } from '../types';

interface JudgeScoreFormProps {
  hackathonId: string;
  judgeId: string;
  criteria: JudgingCriterion[];
  participants: HackathonParticipant[];
  onSubmitScore: (input: SubmitScoreInput) => void;
  existingScores?: { projectId: string; criterionId?: string; score: number }[];
}

export function JudgeScoreForm({
  hackathonId,
  judgeId,
  criteria,
  participants,
  onSubmitScore,
  existingScores = [],
}: JudgeScoreFormProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  const projectsWithSubmissions = participants.filter((p) => p.status === 'submitted' && p.projectId);

  const getExisting = (projectId: string, criterionId?: string) => {
    return existingScores.find(
      (s) => s.projectId === projectId && (s.criterionId ?? '') === (criterionId ?? '')
    )?.score;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const project = projectsWithSubmissions.find((p) => p.projectId === selectedProject);
    if (!project?.projectName) return;

    if (criteria.length > 0) {
      criteria.forEach((c) => {
        const score = scores[c.id] ?? getExisting(selectedProject, c.id) ?? 50;
        onSubmitScore({
          hackathonId,
          projectId: selectedProject,
          judgeId,
          criterionId: c.id,
          score,
          feedback: criteria.length === 1 ? feedback : undefined,
        });
      });
    } else {
      const score = scores.overall ?? getExisting(selectedProject) ?? 50;
      onSubmitScore({
        hackathonId,
        projectId: selectedProject,
        judgeId,
        score,
        feedback,
      });
    }
    setFeedback('');
    setScores({});
    setSelectedProject('');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Submit scores</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a project and rate it. You can update your score by submitting again.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project to score" />
              </SelectTrigger>
              <SelectContent>
                {projectsWithSubmissions.map((p) => (
                  <SelectItem key={p.id} value={p.projectId!}>
                    {p.projectName ?? p.teamName ?? p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <>
              {criteria.length > 0 ? (
                <div className="space-y-4">
                  {criteria.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <Label>
                        {c.name} ({c.weight}% weight)
                      </Label>
                      <Slider
                        value={[scores[c.id] ?? getExisting(selectedProject, c.id) ?? 50]}
                        onValueChange={([v]) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Overall score (0–100)</Label>
                  <Slider
                    value={[scores.overall ?? getExisting(selectedProject) ?? 50]}
                    onValueChange={([v]) => setScores((prev) => ({ ...prev, overall: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Brief feedback for the team..."
                  rows={3}
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={!selectedProject}>
            Submit score
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
